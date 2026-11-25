# 数据库结构与数据记录

姓名：宿鹏翔 | 学号：24002120405 | 大模型：DeepSeek-V4.1-Flash

> 本文件按执行顺序记录全部建库、建表与数据插入语句，仅凭本文件即可在新机器上完整重建数据库。
> 执行方式：按顺序执行下方 SQL 代码块（需具备 root 权限）。

---

## 2026-11-25 首次建库建表：科技新闻

### 1. 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS spx_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE spx_db;
```

### 2. 创建科技新闻表 spx_news

```sql
CREATE TABLE IF NOT EXISTS spx_news (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  title VARCHAR(200) NOT NULL COMMENT '新闻标题',
  summary VARCHAR(500) NOT NULL COMMENT '新闻摘要',
  content TEXT NOT NULL COMMENT '新闻正文',
  source VARCHAR(100) NOT NULL COMMENT '来源媒体',
  publish_time DATETIME NOT NULL COMMENT '发布时间',
  cover_img VARCHAR(255) NOT NULL DEFAULT '' COMMENT '封面图地址',
  PRIMARY KEY (id),
  KEY idx_spx_publish_time (publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='科技新闻表';
```

### 3. 插入 10 条科技新闻测试数据

```sql
INSERT INTO spx_news (title, summary, content, source, publish_time, cover_img) VALUES
('华为发布 Mate 70 系列旗舰手机', '华为在深圳发布 Mate 70 系列旗舰手机，全系搭载原生鸿蒙操作系统，并在影像、通信与 AI 能力上全面升级。', '2024 年 11 月 26 日，华为在深圳举行 Mate 品牌盛典，正式发布 Mate 70 系列手机。该系列首发搭载原生鸿蒙操作系统，支持卫星寻呼、红枫原色影像等新特性，被视为国产高端手机的重要迭代产品。', '新华网', '2024-11-26 10:00:00', 'images/spx_news_01.jpg'),
('神舟十九号载人飞船发射成功', '长征二号F遥十九运载火箭在酒泉卫星发射中心点火升空，神舟十九号载人飞船顺利进入预定轨道。', '2024 年 10 月 30 日凌晨，神舟十九号载人飞船在酒泉卫星发射中心发射升空，航天员乘组状态良好，发射取得圆满成功，随后与空间站组合体完成自主快速交会对接。', '中国新闻网', '2024-10-30 04:27:00', 'images/spx_news_02.jpg'),
('深度求索发布开源推理模型 DeepSeek-R1', '国产大模型团队深度求索发布 DeepSeek-R1，通过强化学习提升推理能力，并开源模型权重。', '2025 年 1 月 20 日，深度求索正式发布推理模型 DeepSeek-R1，在数学、代码等任务上表现突出，同时公开模型权重与技术细节，引发国内外对大模型训练成本与开源路线的广泛讨论。', '科技日报', '2025-01-20 20:00:00', 'images/spx_news_03.jpg'),
('嫦娥六号完成世界首次月球背面采样返回', '嫦娥六号返回器携带月球背面样品安全着陆内蒙古四子王旗，实现世界首次月球背面采样返回。', '2024 年 6 月 25 日，嫦娥六号返回器准确着陆于内蒙古四子王旗预定区域，带回约 1935 克月球背面样品，标志着我国探月工程嫦娥六号任务取得圆满成功。', '央视新闻', '2024-06-25 14:07:00', 'images/spx_news_04.jpg'),
('华为正式发布原生鸿蒙 HarmonyOS NEXT', '华为发布完全自研的移动操作系统 HarmonyOS NEXT，不再兼容安卓应用，生态进入新阶段。', '2024 年 10 月 22 日，华为在原生鸿蒙之夜发布会中正式推出 HarmonyOS NEXT，系统从内核到应用框架实现全栈自研，已有上万款应用完成原生适配。', '人民日报', '2024-10-22 19:30:00', 'images/spx_news_05.jpg'),
('苹果 Vision Pro 在中国大陆正式开售', '苹果首款空间计算设备 Vision Pro 在中国大陆开售，起售价 29999 元。', '2024 年 6 月 28 日，苹果 Vision Pro 在中国大陆正式开售，用户可体验空间视频、沉浸式影音与多窗口办公等能力，被视为空间计算设备进入消费市场的重要一步。', '新浪科技', '2024-06-28 09:00:00', 'images/spx_news_06.jpg'),
('小米 SU7 正式发布', '小米首款汽车 SU7 上市，定位 C 级高性能生态科技轿车，主打智能座舱与人车家全生态互联。', '2024 年 3 月 28 日，小米举行汽车上市发布会，正式发布 SU7 系列车型，搭载小米澎湃 OS 智能座舱，实现手机、家居与车机之间的生态互联。', '36氪', '2024-03-28 19:00:00', 'images/spx_news_07.jpg'),
('OpenAI 发布多模态大模型 GPT-4o', 'OpenAI 推出 GPT-4o，可实时处理文本、音频与图像，响应速度接近人类对话水平。', '2024 年 5 月 14 日（北京时间），OpenAI 发布新一代多模态模型 GPT-4o，"o" 代表 omni，模型可原生支持语音、视觉与文本输入输出，并向免费用户开放部分能力。', 'IT之家', '2024-05-14 01:00:00', 'images/spx_news_08.jpg'),
('我国科学家研制出 255 个光子的量子计算原型机“九章三号”', '中国科学技术大学团队构建“九章三号”量子计算原型机，刷新光量子信息技术世界纪录。', '2023 年 10 月 11 日，中国科学技术大学潘建伟团队宣布成功构建 255 个光子的量子计算原型机“九章三号”，在求解高斯玻色取样问题上展现出超越经典计算机的算力优势。', '新华社', '2023-10-11 10:00:00', 'images/spx_news_09.jpg'),
('七部门公布《生成式人工智能服务管理暂行办法》', '国家网信办等七部门公布生成式人工智能服务管理暂行办法，自 2023 年 8 月 15 日起施行。', '2023 年 7 月 13 日，国家网信办联合国家发展改革委、教育部等七部门公布《生成式人工智能服务管理暂行办法》，对生成式人工智能服务的数据合规、内容标识与安全评估等提出明确要求。', '中国网信网', '2023-07-13 15:00:00', 'images/spx_news_10.jpg');
```

---

## 2026-11-25 新增图文列表表：spx_gallery

### 1. 创建图文列表表 spx_gallery

```sql
USE spx_db;

CREATE TABLE IF NOT EXISTS spx_gallery (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文ID',
  title VARCHAR(150) NOT NULL COMMENT '标题',
  description VARCHAR(500) NOT NULL COMMENT '描述',
  img_url VARCHAR(500) NOT NULL DEFAULT '' COMMENT '图片地址',
  category VARCHAR(50) NOT NULL COMMENT '分类',
  create_time DATETIME NOT NULL COMMENT '创建时间',
  PRIMARY KEY (id),
  KEY idx_spx_gallery_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='图文列表表';
```

### 2. 插入 8 条图文测试数据

```sql
INSERT INTO spx_gallery (title, description, img_url, category, create_time) VALUES
('AI 算力数据中心扩容', '大规模 GPU 集群为训练大模型提供算力支撑，液冷散热与高速互联成为新建数据中心的关键技术。', 'images/spx_gallery_01.jpg', '人工智能', '2026-11-24 10:30:00'),
('中国空间站常态化运营', '空间站组合体长期在轨运行，多个科学实验柜持续开展微重力条件下的材料与生命科学实验。', 'images/spx_gallery_02.jpg', '航天科技', '2026-11-22 09:15:00'),
('量子计算实验室新进展', '超导量子处理器在极低温环境中运行，科研团队持续提升量子比特的相干时间与操控精度。', 'images/spx_gallery_03.jpg', '量子计算', '2026-11-20 16:40:00'),
('智能电动汽车加速普及', '城区辅助驾驶与高压快充技术下沉到更多车型，智能座舱成为用户购车的重要考量。', 'images/spx_gallery_04.jpg', '智能出行', '2026-11-18 14:20:00'),
('空间计算设备走向消费市场', '混合现实头显在观影、办公与空间视频等场景中落地，生态内容成为竞争焦点。', 'images/spx_gallery_05.jpg', '智能硬件', '2026-11-15 11:05:00'),
('多设备协同生态成形', '手机、平板与电脑之间实现应用接续与文件互传，跨设备协同成为操作系统的重要能力。', 'images/spx_gallery_06.jpg', '消费电子', '2026-11-12 19:30:00'),
('月球探测任务持续推进', '嫦娥系列任务带回月球背面样品，为研究月球演化历史提供珍贵科研材料。', 'images/spx_gallery_07.jpg', '航天科技', '2026-11-08 08:45:00'),
('芯片制造工艺持续演进', '先进制程与封装技术同步推进，产业链在设备、材料与设计工具上加速自主创新。', 'images/spx_gallery_08.jpg', '半导体', '2026-11-05 13:10:00');
```

---

## 知识库（RAG）表结构（2026-11-25 20:19）

```sql
USE spx_db;

-- 知识库文件表
CREATE TABLE IF NOT EXISTS spx_kb_file (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spx_filename VARCHAR(255) NOT NULL,
  spx_ext VARCHAR(10) NOT NULL,
  spx_size INT NOT NULL,
  spx_chunk_count INT NOT NULL DEFAULT 0,
  spx_content LONGTEXT,
  spx_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 知识库片段表
CREATE TABLE IF NOT EXISTS spx_kb_chunk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  spx_file_id INT NOT NULL,
  spx_index INT NOT NULL,
  spx_content TEXT NOT NULL,
  spx_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_spx_kb_file (spx_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 测试数据：2 个知识库文件（由 knowledge/ 目录下的 docx、pptx 上传解析而来）
INSERT INTO spx_kb_file (id, spx_filename, spx_ext, spx_size, spx_chunk_count, spx_content, spx_create_time) VALUES (5, '中华美食街门店服务手册.docx', '.docx', 10699, 4, '中华美食街门店服务手册\n宿鹏翔 | 24002120405 | 2026-11-25 | DeepSeek-V4.1-Flash\n一、品牌简介\n中华美食街是云栖市长安街的综合餐饮门店，主打川湘风味与地方小吃，营业面积 600 平方米，可同时接待 180 位顾客，设有 6 个包间。\n二、营业时间\n每天 10:00 开始营业，22:00 打烊，21:30 停止点单。周末与法定节假日正常营业；春节农历正月初一至初三休市，初四恢复营业。\n三、门店地址与交通\n门店地址：云栖市长安街 88 号美食广场 1 层 A12 铺。地铁 2 号线长安街站 B 口步行 200 米；自驾可停美食广场地下停车场 B2 层，消费满 100 元免 2 小时停车费。\n四、招牌菜与价格\n招牌牛肉面 28 元；手工酸辣粉 16 元；现烤羊肉串 6 元一串；糖油粑粑 12 元；桂花酒酿圆子 10 元；剁椒鱼头 68 元；毛血旺 58 元。人均消费约 55 元。\n五、外卖配送\n配送范围为门店周边 3 公里，满 30 元免配送费，未满 30 元收取 5 元配送费。配送时间 11:00 至 21:30，雨天或高峰期可能延迟 15 至 20 分钟。超出配送范围建议到店自取，自取可享 9.5 折。\n六、优惠活动\n每周二会员日全场 8.8 折；持学生证到店消费 9 折；单笔满 50 元减 5 元，满 100 元减 15 元，优惠不可叠加使用。\n七、发票与预约\n支持开具电子普通发票，下单时备注抬头与税号即可，3 个工作日内发送至预留邮箱。6 人以上聚餐建议提前一天电话预约包间。\n八、联系方式\n客服电话 400-800-1234，服务时间 10:00 至 22:00；加盟咨询请拨打 400-800-5678。\n', '2026-11-25 12:19:46');
INSERT INTO spx_kb_file (id, spx_filename, spx_ext, spx_size, spx_chunk_count, spx_content, spx_create_time) VALUES (6, '中华美食街常见问题.pptx', '.pptx', 100724, 4, '第 1 页：中华美食街常见问题 客服问答手册（PPT 版） 宿鹏翔 | 24002120405 | 2026-11-25 | DeepSeek-V4.1-Flash\n\n第 2 页：门店营业到几点？ 每天 10:00 至 22:00 营业，21:30 停止点单。 节假日正常营业，春节初一至初三休市。\n\n第 3 页：有哪些招牌菜？ 招牌牛肉面 28 元、手工酸辣粉 16 元、现烤羊肉串 6 元/串。 糖油粑粑 12 元、桂花酒酿圆子 10 元、剁椒鱼头 68 元。 人均消费约 55 元。\n\n第 4 页：配送范围与配送费？ 门店周边 3 公里内可配送。 满 30 元免配送费，未满 30 元收 5 元。 配送时间 11:00 至 21:30，雨天可能延迟。\n\n第 5 页：需要提前预约吗？ 普通就餐无需预约，高峰时段建议提前 1 小时电话排号。 6 人以上聚餐请提前 1 天预约包间。\n\n第 6 页：停车方便吗？ 美食广场地下停车场 B2 层车位充足。 消费满 100 元可免 2 小时停车费。\n\n第 7 页：支持哪些支付方式？ 微信、支付宝、云闪付、现金均可。 企业客户可对公转账，需提前联系客服。\n\n第 8 页：有素食和儿童餐吗？ 提供 8 道素食菜品，可要求少辣不辣。 提供儿童套餐 25 元，含主食、水果与饮品。\n\n第 9 页：如何开发票？ 支持电子普通发票。 下单备注抬头与税号，3 个工作日内发送邮箱。\n\n第 10 页：加盟与投诉渠道 加盟咨询：400-800-5678。 客服与投诉：400-800-1234，服务时间 10:00 至 22:00。', '2026-11-25 12:19:46');

-- 测试数据：8 个知识库片段
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (13, 5, 1, '中华美食街门店服务手册宿鹏翔 | 24002120405 | 2026-11-25 | DeepSeek-V4.1-Flash一、品牌简介中华美食街是云栖市长安街的综合餐饮门店，主打川湘风味与地方小吃，营业面积 600 平方米，可同时接待 180 位顾客，设有 6 个包间。二、营业时间每天 10:00 开始营业，22:00 打烊，21:30 停止点单。周末与法定节假日正常营业；春节农历正月初一至初三休市，初四恢复营业。三、门店地址与交通', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (14, 5, 2, '春节农历正月初一至初三休市，初四恢复营业。三、门店地址与交通门店地址：云栖市长安街 88 号美食广场 1 层 A12 铺。地铁 2 号线长安街站 B 口步行 200 米；自驾可停美食广场地下停车场 B2 层，消费满 100 元免 2 小时停车费。四、招牌菜与价格招牌牛肉面 28 元；手工酸辣粉 16 元；现烤羊肉串 6 元一串；糖油粑粑 12 元；桂花酒酿圆子 10 元；剁椒鱼头 68 元；毛血旺 58 元。人均消费约 55 元。', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (15, 5, 3, '人均消费约 55 元。五、外卖配送配送范围为门店周边 3 公里，满 30 元免配送费，未满 30 元收取 5 元配送费。配送时间 11:00 至 21:30，雨天或高峰期可能延迟 15 至 20 分钟。超出配送范围建议到店自取，自取可享 9.5 折。六、优惠活动每周二会员日全场 8.8 折；持学生证到店消费 9 折；单笔满 50 元减 5 元，满 100 元减 15 元，优惠不可叠加使用。七、发票与预约', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (16, 5, 4, '单笔满 50 元减 5 元，满 100 元减 15 元，优惠不可叠加使用。七、发票与预约支持开具电子普通发票，下单时备注抬头与税号即可，3 个工作日内发送至预留邮箱。6 人以上聚餐建议提前一天电话预约包间。八、联系方式客服电话 400-800-1234，服务时间 10:00 至 22:00；加盟咨询请拨打 400-800-5678。', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (17, 6, 1, '第 1 页：中华美食街常见问题 客服问答手册（PPT 版） 宿鹏翔 | 24002120405 | 2026-11-25 | DeepSeek-V4.1-Flash第 2 页：门店营业到几点？每天 10:00 至 22:00 营业，21:30 停止点单。节假日正常营业，春节初一至初三休市。第 3 页：有哪些招牌菜？招牌牛肉面 28 元、手工酸辣粉 16 元、现烤羊肉串 6 元/串。', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (18, 6, 2, '招牌牛肉面 28 元、手工酸辣粉 16 元、现烤羊肉串 6 元/串。糖油粑粑 12 元、桂花酒酿圆子 10 元、剁椒鱼头 68 元。人均消费约 55 元。第 4 页：配送范围与配送费？门店周边 3 公里内可配送。满 30 元免配送费，未满 30 元收 5 元。配送时间 11:00 至 21:30，雨天可能延迟。第 5 页：需要提前预约吗？普通就餐无需预约，高峰时段建议提前 1 小时电话排号。6 人以上聚餐请提前 1 天预约包间。', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (19, 6, 3, '6 人以上聚餐请提前 1 天预约包间。第 6 页：停车方便吗？美食广场地下停车场 B2 层车位充足。消费满 100 元可免 2 小时停车费。第 7 页：支持哪些支付方式？微信、支付宝、云闪付、现金均可。企业客户可对公转账，需提前联系客服。第 8 页：有素食和儿童餐吗？提供 8 道素食菜品，可要求少辣不辣。提供儿童套餐 25 元，含主食、水果与饮品。第 9 页：如何开发票？支持电子普通发票。下单备注抬头与税号，3 个工作日内发送邮箱。', '2026-11-25 12:19:46');
INSERT INTO spx_kb_chunk (id, spx_file_id, spx_index, spx_content, spx_create_time) VALUES (20, 6, 4, '下单备注抬头与税号，3 个工作日内发送邮箱。第 10 页：加盟与投诉渠道 加盟咨询：400-800-5678。客服与投诉：400-800-1234，服务时间 10:00 至 22:00。', '2026-11-25 12:19:46');
```
