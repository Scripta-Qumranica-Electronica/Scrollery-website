package SQE_database;
use strict;
use warnings FATAL => 'all';
use DBI;
use SQE_database_queries;
use SQE_Error;
use SQE_Restricted;

use Exporter 'import';
my @EXPORT = qw(get_dbh get_login get_login_sqe);

# Returns a valid database handler
# or an array with (undef, error code, error text)
sub get_dbh {
    my %attr     = (
        PrintError => 0,    # turn off error reporting via warn()
        RaiseError => 1
    );                      # turn on error reporting via die()
    my $dbh = DBI->connect( SQE_Restricted::DSN_SQE_A, SQE_Restricted::DB_USERNAME, SQE_Restricted::DB_PASSWORD, \%attr );
    if ($dbh) {
        return $dbh;
    }
    else {
        return undef, SQE_Error::NO_DBH;
    }
}



#Opens an database handler and tries to login in with the given data.
#On success, it returns the handler and the user id
#On error, it returns undef for the handler and the Errorcode + Errorstring
sub get_login {
    my ( $user_name, $password ) = @_;

    #Return with error data if either user name or password is missing
    return SQE_Error::WRONG_USER_DATA
      if not( $user_name && $password );

    # Try to get an database handler
    my ( $dbh, @error ) = get_dbh();

    # Return with error data if no database handler is available
    return @error if not $dbh;

    # Try to get the user id
    my $sth = $dbh->prepare(SQE_database_queries::GET_LOGIN);
    $sth->execute( $user_name, $password );
    if ( (my $user_data =
        $sth->fetchrow_arrayref()) && not $sth->fetchrow_arrayref() )
    {
        #We got a unique user id - return datbase handler and id
        $sth->finish();
        return $dbh, $user_data->[0];
    }
    elsif ($user_data) {

    # We got more than one user ids - return without handler but with error data
        $sth->finish();
        $dbh->disconnect();
        return undef, SQE_Error::NO_UNIQUE_USER;

    }
    else {
        # We got no user id - - return without handler but with error data
        $sth->finish(), $dbh->disconnect();
        return undef, SQE_Error::WRONG_USER_DATA;
    }
}

sub get_login_sqe {
    my ( $user_name, $password ) = @_;

    #Return with error data if either user name or password is missing
    return SQE_Error::WRONG_USER_DATA
        if not( $user_name && $password );

    # Try to get an database handler
    my ( $dbh, @error ) = get_dbh_sqe();

    # Return with error data if no database handler is available
    return @error if not $dbh;

    # Try to get the user id
    my $sth = $dbh->prepare(SQE_database_queries::GET_LOGIN);
    $sth->execute( $user_name, $password );
    if ( (my $user_data =
        $sth->fetchrow_arrayref()) && not $sth->fetchrow_arrayref() )
    {
        #We got a unique user id - return datbase handler and id
        $sth->finish();
        return $dbh, $user_data->[0];
    }
    elsif ($user_data) {

        # We got more than one user ids - return without handler but with error data
        $sth->finish();
        $dbh->disconnect();
        return undef, SQE_Error::NO_UNIQUE_USER;

    }
    else {
        # We got no user id - - return without handler but with error data
        $sth->finish(), $dbh->disconnect();
        return undef, SQE_Error::WRONG_USER_DATA;
    }
}




1;
