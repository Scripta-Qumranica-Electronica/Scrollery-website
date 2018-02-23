package SQE_API::Queries;
use strict;
use warnings FATAL => 'all';
use Package::Constants;


use constant {

    GET_SCROLLS => << 'MYSQL',
	SELECT scroll.scroll_id, scroll_data.name
	FROM scroll
		 JOIN scroll_data USING (scroll_id)
		JOIN  scroll_data_owner USING (scroll_data_id)
	WHERE scroll_data.name like ?
		AND scroll_data_owner.scroll_version_id = _scrollversion_
	ORDER BY scroll_data.name;
MYSQL

    # Returns the Id and name of a scroll
    #    GET_SCROLL => <<'MYSQL',
    #	SELECT `scroll`.scroll_id, scroll.name
    #	FROM `scroll`
    #	WHERE `scroll`.name like ?;
    #MYSQL

    # Returns the Id's of fragment
    GET_FRAGMENTS => <<'MYSQL',
    SELECT
		col_data.col_id,
		col_data.name
	FROM scroll_to_col
		JOIN col_data USING (col_id)
		JOIN col_data_owner USING (col_data_id)
	WHERE scroll_to_col.scroll_id=?
	AND col_data.name REGEXP ?
	AND col_data_owner.scroll_version_id= _scrollversion_
MYSQL

    # Returns the Id's of lines
    GET_LINES => <<'MYSQL',
    SELECT
		line_data.name
	FROM col_to_line
		JOIN line_data USING (line_id)
		JOIN line_data_owner USING (line_data_id)
	WHERE col_to_line.col_id=?
	AND line_data.name like ?
	AND line_data_owner.scroll_version_id= _scrollversion_
MYSQL

    # Returns the Sign_Id of a fragment break
    GET_FRAGMENT_BREAK => <<'MYSQL',
SELECT sign_char.sign_id
FROM col_to_line
	JOIN line_to_sign USING (line_id)
	JOIN sign_char USING (sign_id)
	JOIN sign_char_owner USING (sign_char_id)
WHERE col_to_line.col_id = ?
	  AND FIND_IN_SET(?,sign_char.break_type)
	AND sign_char_owner.scroll_version_id= _scrollversion_
MYSQL

    GET_LINE_BREAK => <<'MYSQL',

SELECT sign_char.sign_id, col_to_line.line_id
FROM col_to_line
	JOIN line_data USING (line_id)
	JOIN line_to_sign USING (line_id)
	JOIN sign_char USING (sign_id)
	JOIN sign_char_owner USING (sign_char_id)
WHERE col_to_line.col_id = ?
AND line_data.name like ?
	  AND FIND_IN_SET(?,sign_char.break_type)
	AND sign_char_owner.scroll_version_id= _scrollversion_

MYSQL

    # Returns the Sign_Id of a fragment break
    GET_LINE_DATA => <<'MYSQL',
    SELECT
		position_in_stream.next_sign_id,
		line_data.name
	FROM sign
		JOIN position_in_stream USING (sign_id)
		JOIN position_in_stream_owner USING (position_in_stream_id)
		JOIN line_to_sign USING (sign_id)
		JOIN line_data USING (line_id)
	WHERE sign.sign_id = ?
	AND position_in_stream_owner.scroll_version_id= _scrollversion_
MYSQL

	GET_NEXT_POSITION => <<'MYSQL',
SELECT
	position_in_stream.next_sign_id
FROM position_in_stream
	JOIN position_in_stream_owner USING (position_in_stream_id)
WHERE position_in_stream.sign_id=?
	  AND position_in_stream_owner.scroll_version_id= _scrollversion_

MYSQL






	GET_ALL_SIGN_POSITIONS_IN_FRAGMENT => <<'MYSQL',
SELECT 	sign_relative_position.`type`,
	sign_relative_position.sign_id
FROM col_to_line
	JOIN line_to_sign USING (line_id)
	JOIN sign_relative_position USING (sign_id)
	JOIN sign_relative_position_owner USING (sign_relative_position_id)
WHERE 	col_to_line.col_id=?
		 AND sign_relative_position_owner.scroll_version_id= _scrollversion_
ORDER BY sign_relative_position.sign_id, LEVEL
MYSQL

	GET_ALL_SIGN_POSITIONS_IN_LINE => <<'MYSQL',
    SELECT 	sign_relative_position.`type`,
			sign_relative_position.sign_id
	FROM line_to_sign
		JOIN sign_relative_position USING (sign_id)
		JOIN sign_relative_position_owner USING (sign_relative_position_id)
	WHERE 	line_id=?
		AND sign_relative_position_owner.scroll_version_id= _scrollversion_
     ORDER BY sign_relative_position.sign_id, LEVEL
MYSQL

};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;
