package SQE_API::format_qwb_html;
use strict;
use warnings FATAL => 'all';
use lib qw(../);
use parent 'SQE_API::format_json';

sub new {
    my $class = shift;
    my $self  = $class->SUPER::new(@_);
    $self->{current_relative_positions} = [];
    bless( $self, $class );
    return $self;
}

sub format_scroll {
    my $self = shift;
    $self->{is_first_fragment} = 1;
    ${ $self->{out_text} } .=
        '"VALUE":"<div class=\"QWB_SCROLL\"><span class=\"QWB_SCROLL_NAME\">'
      . shift
      . '</span>';
}

sub format_fragment {
    ${ shift->{out_text} } .=
        '<div class=\"QWB_FRAGMENT\"><span class=\"QWB_FRAGMENT_NAME\">'
      . shift
      . '</span>';

}

sub format_column_end {
    ${ shift->{out_text} } .= '</div>';
}

sub format_line {
    my $self = shift;
    if ( $self->{is_first_line} ) {
        $self->{is_first_line} = 0;
        $self->{is_first_sign} = 1;
        ${ $self->{out_text} } .=
            '<div class=\"QWB_LINE\"><span class=\"QWB_LINE_NAME\">'
          . shift
          . '</span>';
    }
    else {
        ${ $self->{out_text} } .=
            '</div><div class=\"QWB_LINE\"><span class=\"QWB_LINE_NAME\">'
          . shift
          . '</span>';
    }

}

sub format_sign {
    my $self = shift;

    my $array_ref = shift;
#    $self->{position_sth}->execute($array_ref->[1], 0, 0);
   my $positions = shift->{$array_ref->[1]};
#    while (my $row_ref = $self->{position_sth}->fetchrow_arrayref) {
#        push @positions, $row_ref->[0];#   }
    my $equals = 0;
    while (@{ $self->{current_relative_positions} }
        && $positions->[$equals]
        && $self->{current_relative_positions}->[0] eq $positions->[$equals]->[0] )
    {
        $equals++;
    }
    while ( $equals < @{ $self->{current_relative_positions} } ) {
        ${ $self->{out_text} } .= '</div>';
        pop @{ $self->{current_relative_positions} };
    }
    while ($positions->[$equals]) {
    push( @{ $self->{current_relative_positions} }, $positions->[$equals]->[0] );
    ${ $self->{out_text} } .=
          '<div class=\"QWB_' . $positions->[$equals]->[0] . '\">';
        $equals++;
    }

    ${ $self->{out_text} } .= '<span class=\"QWB_SIGN';
    ${ $self->{out_text} } .= ', QWB_VARIANT' if $array_ref->[11] > 0;
    if ( $array_ref->[3] != 1 ) {
        $array_ref->[4] =~ s/ /_/go;
        ${ $self->{out_text} } .= ', QWB_' . uc( $array_ref->[4] );
    }
    if ( $array_ref->[10] ) {
        $array_ref->[10] =~ s/,/ QWB_/go;
        ${ $self->{out_text} } .= ', QWB_' . $array_ref->[10];
    }
    ${ $self->{out_text} } .= ', QWB_RECONSTRUCTED' if $array_ref->[9];
    ${ $self->{out_text} } .= '\" data-sign-id=\"' . $array_ref->[1] . '\"';
    ${ $self->{out_text} } .=
      $array_ref->[5] != 1
      ? ( 'style=\"width: ' . $array_ref->[5] . 'em\">' )
      : '>';
    ${ $self->{out_text} } .= ( $array_ref->[2] ? $array_ref->[2] : ' ' );
    ${ $self->{out_text} } .= '֯'
      if ($array_ref->[7] && $array_ref->[7] eq 'INCOMPLETE_AND_NOT_CLEAR');
    ${ $self->{out_text} } .= '</span>';

}

sub format_end {
    ${ shift->{out_text} } .= '</div></div>"';

}

1;
