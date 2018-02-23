package SQE_API::format_json;
use strict;
use warnings FATAL => 'all';
use SQE_API::Queries;

sub new {
    my $class = shift;
    my $self  = bless {
        out_text          => shift,
        is_first_line     => 1,
        is_first_fragment => 1,
        is_first_sign     => 1,

    }, $class;
    return $self;
}

sub format_scroll {
    my $self = shift;
    $self->{is_first_fragment} = 1;
    ${ $self->{out_text} } .= '"VALUE":{"SCROLL":"' . shift . '","FRAGMENTS":[';
}

sub format_fragment {
    my $self = shift;
    $self->{is_first_line} = 1;
    ${ $self->{out_text} } .= '{"FRAGMENT":"' . shift . '","LINES":[';

}

sub format_column_end {
    my $self = shift;
    chop ${ $self->{out_text} };
    ${ $self->{out_text} } .= ']}]},';
}

sub format_line {
    my $self = shift;
    if ( $self->{is_first_line} ) {
        $self->{is_first_line} = 0;
        $self->{is_first_sign} = 1;
        ${ $self->{out_text} } .= '{"LINE":"' . shift . '","SIGNS":[';
    }
    else {
        chop ${ $self->{out_text} };
        ${ $self->{out_text} } .= ']},{"LINE":"' . shift . '","SIGNS":[';
    }
}

sub format_sign {
    my $self               = shift;
    my $array_ref          = shift;
    my $sign_positions_ref = shift;
    my $sign_text          = '';
    if ( $self->{is_first_sign} ) {
        $self->{is_first_sign} = 0;
    }
    else {
        $sign_text = '}';
    }
    $sign_text = '{"SIGN_ID":' . $array_ref->[1] . ",";
    $sign_text .=
      '"SIGN":"' . ( $array_ref->[2] ? $array_ref->[2] : ' ' ) . '",';
    $sign_text .= '"SIGN_TYPE":"' . $array_ref->[4] . '",'
      if $array_ref->[3] != 1;
    $sign_text .= '"SIGN_WIDTH":' . $array_ref->[5] . ','
      if $array_ref->[5] != 1;
    if ( $array_ref->[12] ) {
        $sign_text .= '"MIGHT_BE_WIDER":true' . ',' if $array_ref->[6];
        $sign_text .= '"READABILITY":"' . $array_ref->[7] . '",'
          if $array_ref->[7] && $array_ref->[7] ne 'COMPLETE';
        $sign_text .= '"IS_RETRACED":true' . ','      if $array_ref->[8];
        $sign_text .= '"IS_RECONSTRUCTED":true' . ',' if $array_ref->[9];
    }

    if ( $array_ref->[10] ) {
        $array_ref->[10] =~ s/,/","/go;
        $sign_text .= '"CORRECTION":["' . $array_ref->[10] . '"],';
    }

    if ( my $positions_ref = $sign_positions_ref->{ $array_ref->[1] } ) {
        $sign_text .=
          '"RELATIVE_POSITION":["' . ( shift @{$positions_ref} )->[0];
        foreach my $position ( @{$positions_ref} ) {
            $sign_text .= '","' . $position->[0];
        }
        $sign_text .= '"],';
    }

    #   if ( $array_ref->[11] ) {
    #       $array_ref->[11] =~ s/,/","/go;
    #       $sign_text .= '"RELATIVE_POSITION":["' . $array_ref->[11] . '"],';
    #  }
    $sign_text .= '"IS_VARIANT":true' . ',' if $array_ref->[11] > 0;
    chop $sign_text;
    ${ $self->{out_text} } .= $sign_text . '},';
}

sub format_end {
    my $self = shift;
    chop ${ $self->{out_text} };
    ${ $self->{out_text} } .= ']}';

}

1;
