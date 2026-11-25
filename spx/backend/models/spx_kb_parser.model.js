/**
 * 姓名：宿鹏翔 | 学号：24002120405 | 时间：2026-11-25 | 大模型：DeepSeek-V4.1-Flash
 * 功能：知识库文件解析与切片（docx / doc / pptx / ppt / pdf / txt）
 */

const path = require('path');
const AdmZip = require('adm-zip');
const WordExtractor = require('word-extractor');
const pdfParse = require('pdf-parse');
const iconv = require('iconv-lite');

// 解码 XML 中的常见实体
function spx_decodeXml(spx_text) {
  return spx_text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// 解析 docx：解压后读取 word/document.xml，按段落提取文本
function spx_parseDocx(spx_buffer) {
  const spx_zip = new AdmZip(spx_buffer);
  const spx_entry = spx_zip.getEntry('word/document.xml');
  if (!spx_entry) {
    throw new Error('docx 文件结构异常：未找到 word/document.xml');
  }
  const spx_xml = spx_zip.readAsText(spx_entry);
  return spx_decodeXml(
    spx_xml
      .replace(/<w:tab[^>]*\/>/g, '\t')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, '')
  );
}

// 解析 pptx：遍历 ppt/slides/slideN.xml，提取每页文本（<a:t> 标签）
function spx_parsePptx(spx_buffer) {
  const spx_zip = new AdmZip(spx_buffer);
  const spx_slides = spx_zip.getEntries()
    .filter(function (spx_entry) { return /^ppt\/slides\/slide\d+\.xml$/.test(spx_entry.entryName); })
    .sort(function (spx_a, spx_b) {
      const spx_na = parseInt(spx_a.entryName.match(/slide(\d+)\.xml/)[1], 10);
      const spx_nb = parseInt(spx_b.entryName.match(/slide(\d+)\.xml/)[1], 10);
      return spx_na - spx_nb;
    });

  return spx_slides.map(function (spx_entry, spx_slideIndex) {
    const spx_xml = spx_zip.readAsText(spx_entry);
    const spx_texts = [];
    const spx_regex = /<a:t>([\s\S]*?)<\/a:t>/g;
    let spx_match = spx_regex.exec(spx_xml);
    while (spx_match) {
      spx_texts.push(spx_decodeXml(spx_match[1]).trim());
      spx_match = spx_regex.exec(spx_xml);
    }
    return '第 ' + (spx_slideIndex + 1) + ' 页：' + spx_texts.filter(Boolean).join(' ');
  }).join('\n\n');
}

// 解析旧版 doc：借助 word-extractor 读取二进制文档正文
async function spx_parseDoc(spx_buffer) {
  const spx_extractor = new WordExtractor();
  const spx_doc = await spx_extractor.extract(spx_buffer);
  return spx_doc.getBody();
}

// 解析旧版 ppt：二进制文件无标准结构，尽力提取可读文本（UTF-16LE / GBK 片段）
function spx_parsePpt(spx_buffer) {
  const spx_parts = [];
  for (let spx_i = 0; spx_i + 1 < spx_buffer.length; spx_i += 2) {
    const spx_code = spx_buffer.readUInt16LE(spx_i);
    if ((spx_code >= 0x4e00 && spx_code <= 0x9fff) || (spx_code >= 0x20 && spx_code <= 0x7e)) {
      spx_parts.push(spx_code);
    }
  }
  const spx_utf16 = Buffer.alloc(spx_parts.length * 2);
  spx_parts.forEach(function (spx_code, spx_index) { spx_utf16.writeUInt16LE(spx_code, spx_index * 2); });
  const spx_decoded = spx_utf16.toString('utf16le').replace(/[\u0000-\u001f]+/g, ' ');

  const spx_gbk = iconv.decode(spx_buffer, 'gbk').replace(/[^一-龥A-Za-z0-9，。；：、\s]/g, ' ');
  return (spx_decoded + '\n' + spx_gbk)
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// 根据扩展名选择解析器，返回纯文本
async function spx_parseFile(spx_filename, spx_buffer) {
  const spx_ext = path.extname(spx_filename).toLowerCase();

  if (spx_ext === '.docx') {
    return spx_parseDocx(spx_buffer);
  }
  if (spx_ext === '.pptx') {
    return spx_parsePptx(spx_buffer);
  }
  if (spx_ext === '.doc') {
    return spx_parseDoc(spx_buffer);
  }
  if (spx_ext === '.ppt') {
    return spx_parsePpt(spx_buffer);
  }
  if (spx_ext === '.pdf') {
    const spx_pdf = await pdfParse(spx_buffer);
    return spx_pdf.text;
  }
  if (spx_ext === '.txt' || spx_ext === '.md') {
    return spx_buffer.toString('utf8');
  }
  throw new Error('暂不支持的文件类型：' + spx_ext);
}

// 把长文本切成带重叠的片段，尽量按段落与句子边界切分
function spx_chunkText(spx_text, spx_size, spx_overlap) {
  const spx_clean = spx_text.replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim();
  if (!spx_clean) {
    return [];
  }

  const spx_units = spx_clean
    .split(/(?<=[。！？；\n])/)
    .map(function (spx_unit) { return spx_unit.trim(); })
    .filter(Boolean);

  const spx_chunks = [];
  let spx_current = '';

  spx_units.forEach(function (spx_unit) {
    if ((spx_current + spx_unit).length <= spx_size) {
      spx_current += spx_unit;
      return;
    }
    if (spx_current) {
      spx_chunks.push(spx_current);
      // 重叠部分取上一片段末尾的完整句子，避免从半句切入
      const spx_tailMatch = spx_current.match(/[^。！？；\n]*[。！？；\n][^。！？；\n]*$/);
      const spx_tail = spx_tailMatch && spx_tailMatch[0].length <= spx_overlap ? spx_tailMatch[0] : '';
      spx_current = spx_tail + spx_unit;
    } else {
      spx_current = spx_unit;
    }
    while (spx_current.length > spx_size * 2) {
      spx_chunks.push(spx_current.slice(0, spx_size));
      spx_current = spx_current.slice(spx_size - spx_overlap);
    }
  });

  if (spx_current.trim()) {
    spx_chunks.push(spx_current.trim());
  }

  return spx_chunks
    .map(function (spx_chunk) { return spx_chunk.trim(); })
    .filter(function (spx_chunk) { return spx_chunk.length >= 10; });
}

module.exports = { spx_parseFile, spx_chunkText };
