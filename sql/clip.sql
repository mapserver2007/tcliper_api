-- Trush Cliperのクリップデータテーブルを定義するSQL
--
-- 2009.06.04 Ryuichi TANAKA.

-- 表示部に検索機能をつけたらindex張るかも

CREATE DATABASE tclipers;

DROP TABLE tclipers;

CREATE TABLE tclipers (
	id int auto_increment PRIMARY KEY,
	title varchar(250) NOT NULL,
	url varchar(300) NOT NULL UNIQUE,
	comment varchar(1000)
);