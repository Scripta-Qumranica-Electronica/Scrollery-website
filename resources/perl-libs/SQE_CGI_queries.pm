package SQE_CGI_queries;
use strict;
use warnings FATAL => 'all';
use Package::Constants;

use constant {
    NEW_SQE_SESSION => << 'MYSQL',
    INSERT INTO sqe_session
    (sqe_session_id, user_id, scroll_version_id)
        VALUES (?,?,?)
MYSQL

    GET_SQE_SESSION => << 'MYSQL',
    SELECT user_id, scroll_version_id
    FROM sqe_session
    WHERE sqe_session_id = ?
MYSQL

    SET_SESSION_END => << 'MYSQL',
    UPDATE sqe_session
    SET last_internal_session_end = now(),
        scroll_version_id = ?
    WHERE sqe_session_id = ?
MYSQL


};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;