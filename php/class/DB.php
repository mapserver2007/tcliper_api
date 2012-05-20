<?php
/**
 * データベース接続クラス
 * @author   Ryuichi TANAKA
 * @version  2008/09/15
 */
class DB {
	private $dbh, $stmt;
	private $host, $dbms;
	const MYSQL = "mysql";
	const PGSQL = "pgsql";
	const HOST_REMOTE = false; //true:リモート接続, false:ローカル接続
	/**
	 * コンストラクタ
	 * @return 
	 */
	function __construct($dbms = self::MYSQL){
		$this->dbms = $dbms; //使用するDBMSを設定
		$this->defineHost();
		$this->DBConnect();
	}
	/**
	 * デストラクタ
	 * @return 
	 */
	function __destruct(){
		$this->DBClose();
	}
	/**
	 * データベースに接続する
	 * @return 
	 */
	private function DBConnect(){
		try{
			if($this->dbms == self::MYSQL){
				$this->dbh = new PDO("mysql:host={$this->host}; unix_socket=/tmp/mysql.sock; dbname=tclipers", "mysql", "mysql");
			}else if($this->dbms == self::PGSQL){
				//$this->dbh = new PDO("pgsql:host={$this->host} dbname=apikey port=5432", "postgres", "psql");
			}
			$this->dbh->query("SET NAMES utf8;");
		}catch(PDOException $e){
			$this->DBClose();
			die($e->getMessage());
		}
	}
	/**
	 * データベースを切断する
	 * @return 
	 */
	private function DBClose(){
		$this->dbh = null;
	}
	/**
	 * SQLをセットする
	 * @return 
	 * @param $sql String
	 * @param $param Array
	 */
	public function sql($sql, $param){
		$rev = "";
		try{
			$this->stmt = null; //これが重要
			$this->stmt = $this->dbh->prepare($sql);
			$rev = $this->stmt->execute($param);
		}catch(PDOException $e){
			$this->DBClose();
			die($e->getMessage());
		}
		return $rev;
	}	
	/**
	 * SQLを実行する
	 * @return Obejct $result
	 */
	public function fetch(){
		try{
			$result = $this->stmt->fetch();
		}catch(PDOException $e){
			$this->DBClose();
			die($e->getMessage());
		}
		return $result;
	}
	/**
	 * カラム数を返す
	 * @return 
	 */
	public function num(){
		try{
			$result = count($this->stmt->fetchAll());
			//$this->stmt->closeCursor();
		}catch(PDOException $e){
			$this->DBClose();
			die($e->getMessage());
		}
		return $result;
	}
	/**
	 * ホスト名を定義する
	 * @return
	 */
	private function defineHost(){
		$host_addr = array(
			"local" => "localhost",
			"remote" => "192.168.0.103"
		);
		$this->host = self::HOST_REMOTE ? $host_addr["remote"] : $host_addr["local"];
	}
}
?>
