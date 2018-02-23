package SQE_Error;
use strict;
use warnings FATAL => 'all';
use Package::Constants;

use constant {
    NO_DBH          => [ 1, 'No databasehandler available' ],
    WRONG_USER_DATA => [ 2, 'Username and/or password invalid' ],
    NO_UNIQUE_USER  => [ 3, 'No unique user' ],
    WRONG_SESSION_ID=> [4, 'The given session id is not valid.'],

    SCROLL_NOT_FOUND   => [ 101, 'Scroll not found' ],
    NO_UNIQUE_SCROLL   => [ 102, 'No unique scroll' ],
    FRAGMENT_NOT_FOUND => [ 103, 'Fragment not found' ],
    NO_UNIQUE_FRAGMENT => [ 104, 'No unique fragment' ],
    LINE_NOT_FOUND     => [ 105, 'Line not found' ],
    NO_GET_REQUESTS    => [ 106, 'We do not handle GET-requests', ],
    NO_ACTION          => [ 107, 'No valid action requested' ],
    WRONG_FORMAT       => [ 108, 'Format not known or not yet implemented' ],
    NOT_IMPLEMENTED    => [ 109, 'Not yet implemented' ],

    WRONG_SCROLLVERSION => [
        201,
        'The requested version of scroll does not exist or is not available for this user.'
    ],
    RECORD_NOT_FOUND => [ 202, 'The given record could no be found as part of this version of scroll.' ],
    QWB_RECORD => [203, 'You are not allowed to change or delete the basic QWB records.'],
    UNRECOGNIZED_FUNCTION => [204, 'The function given is unknown or provided with wrong data.'],
    FORBIDDEN_FUNCTION => [205, 'The function given is not allowed.'],
    WRONG_PARAMETERS => [206, 'The parameters do not fit the given function'],
};

use Exporter 'import';
our @EXPORT_OK = Package::Constants->list(__PACKAGE__);

1;
