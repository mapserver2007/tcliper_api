#!/usr/bin/perl
use strict;
use warnings;
use CGI;
use Digest::SHA;
use DateTime;
use FindBin::libs qw{ export base=syscommon };
use MyLibs::Common::DB::Config;
use MyLibs::Common::DB::Schema;
use MyLibs::Common::Auth::ApiAuth;

# 使用するDBMSを指定(mysql or pgsql)
my $dbms = "mysql";

# データベース名を指定
my $dbname = "tclipers";

# スキーマファイル名を指定
my $schema_name = "Tclipers";

# CGI開始
my $cgi = new CGI;
print $cgi->header(-type=>"text/html", -charset=>"utf-8");

# POSTデータ取得
my $title   = $cgi->param("title");
my $url     = $cgi->param("url");
my $comment = $cgi->param("comment");
my $apikey  = $cgi->param("apikey");
my $referer = $cgi->referer();

# APIキー認証処理
my $auth = MyLibs::Common::Auth::ApiAuth->new({
	"apikey" => $apikey,
	"referer" => $referer
});

# API認証失敗時のエラーハンドリング
if(!$auth->execAuthentication()){
	print "authorization failed";
	exit;
};

# 現在の時間を取得
my $dt = DateTime->now(time_zone => 'Asia/Tokyo');
my $date = $dt->strftime('%Y-%m-%d %H:%M:%S');

# URLハッシュを取得
my $sha = Digest::SHA->new(256);
my $url_hash = $sha->add($url)->hexdigest;

# DBの接続設定を取得
my ($conf_obj, $db_conf);
$conf_obj = MyLibs::Common::DB::Config->new();
$conf_obj->use_db($dbms);
$db_conf = $conf_obj->get_db_config();

## ORマッピング開始
my $connect_info = ["dbi:$db_conf->{dbms}:dbname=$dbname;host=$db_conf->{host}", $db_conf->{user}, $db_conf->{pass}];
my $schema = MyLibs::Common::DB::Schema->connect(@{$connect_info});
$schema->storage->dbh->do("SET names utf8");

my $result = $schema->resultset($schema_name)->find_or_new({
	title => $title,
	url  => $url,
	url_hash => $url_hash,
	comment  => $comment,
	date => $date
});

# URLが重複していない場合は登録する
unless ($result->in_storage) {
	$result->insert;
	print "clip complete!";
}
# URLが重複している場合は登録しない
else{
	print "already clip this site!";
}

