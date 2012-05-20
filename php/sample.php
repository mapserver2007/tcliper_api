<?php
//クラス読み込み
require_once('./class/DB.php');

$sql = "SELECT * FROM tclipers";
$bind = array();

$db = new DB();
$rv = $db->sql($sql, $bind);		
if($rv === true){
	while($row = $db->fetch()){
		echo "<p><a href=\"" . $row["url"] . "\">" . $row["title"] . "</a></p>";
		echo "<p style=\"font-size:10px;\">" . htmlspecialchars($row["comment"]) . "</p>";
	}
}


?>