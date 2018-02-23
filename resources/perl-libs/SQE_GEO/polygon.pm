package SQE_GEO::polygon;
use strict;
use warnings FATAL => 'all';
use SQE_DBI;
use parent 'SQE_GEO::linestring';



sub new {
    my $class = shift;
    my $self = $class->SUPER::new;
    $self->{child_paths} = [];
    $self->{is_child} = 0;
    $self->{parent} = undef;

    return $self;
}



sub close_path {
    my $self = shift;
    if (! $self->path_clothed) {
        push $self->{x_values}, $self->{x_values}->[0];
        push $self->{y_values}, $self->{y_values}->[0];
    }
}

sub path_clothed {
    my $self = shift;
    return ($self->{x_values}->[0] == $self->{x_values}->[-1]) && ($self->{y_values}->[0] == $self->{y_values}->[-1]);
}

sub flip {
    my $self = shift;
    $self->SUPER::flip;
    map {$_->flip} @{$self->{child_paths}};
}

sub set_as_child_of {
    my ($self, $parent) = @_;
    $self->remove_as_child;
    $parent->add_child($self);
    $self->{parent}=$parent;
    $self->{is_child}=1;
}

sub remove_as_child {
    my $self = shift;
    if (defined $self->{parent}) {
        $self->{parent}->remove_child($self);
        $self->{is_child}=0;
    }
}

sub  remove_child {
    my ($self, $child) = @_;
    @{$self->{child_paths}} = grep { $_ != $child } @{$self->{child_paths}};
}

sub add_child {
    my ($self, $child) = @_;
    push $self->{child_paths}, $child;
}




sub contains {
    my ($self, $parent) = @_;
    my $dbh=SQE_DBI->get_sqe_dbh;
    return $dbh->selectrow_arrayref('SELECT ST_CONTAINS(ST_GEOMFROMTEXT("'
        . $self->_outer_POLYGON_string
        . '"),ST_GEOMFROMTEXT("'
        . $parent->_outer_POLYGON_string
        . '"))'
    )->[0];
}


# Calculate the area of the polygon using the shoelace formula
sub shoelace_area {
    my $self =shift;
    return abs($self->_shoelace_area_sum) / 2;

}


# Internal function, which calucalte the sum-part of the shoelace formual
sub _shoelace_area_sum {
    my $self =shift;
    my $area_sum=0;
    for (my $i=0; $i< @{$self->{x_values}}-1; $i++) {
        my $minus_i = $i == 0 ? 0 : $i-1;
        $area_sum += $self->{x_values}->[$i] * ($self->{y_values}->[$i+1] - $self->{y_values}->[$minus_i]);
    }
    return $area_sum;
}

sub is_clockwise {
    my $self = shift;
    return $self->_shoelace_area_sum >= 0 ? -1 : 1;
}

sub reverse_direction {
    my $self=shift;
    my @x_array = reverse @{$self->{x_values}};
    $self->{x_values}=\@x_array;
    my @y_array = reverse @{$self->{y_values}};
    $self->{y_values}=\@y_array;

}

sub set_clockwise {
    my $self=shift;
    if ($self->is_clockwise<0) {
        $self->reverse_direction;
    }
}

sub set_counter_clockwise {
    my $self=shift;
    if ($self->is_clockwise>0) {
        $self->reverse_direction;
    }
}

sub as_string {
    my $self = shift;
    my $string='((' . $self->_as_string . ')';
    foreach my $polygon (@{$self->{child_paths}}) {
        $string.= ',(' . $polygon->_as_string . ')';
    }
    return $string . ')';
}

sub as_POLYGON_string {
    my $self = shift;
    return 'POLYGON' . $self->as_string;
}

sub _outer_POLYGON_string {
    my ($self) = @_;
    return 'POLYGON((' . $self->_as_string . '))';
}

sub as_SVG_string {
    my $self=shift;
    my $string=$self->as_string;
    $string =~ s/,/ /go;
    $string =~s/\(+/M/go;
    $string =~s/\)+//go;
    return $string;
}

# Recursive est whether the Polygon contains grand childs
# In this case, they are taken out as exterior paths with their childs as interior paths ...
# At the same time all exterior rings ar  set counter-clockwise and all interior clockwise
# Return the polygon itself and all new created exterior polygons.
sub flatten {
    my $self=shift;
    my @array = ($self);
    $self->set_counter_clockwise;
    foreach my $child (@{$self->{child_paths}}) {
           $child->set_clockwise;
        foreach my $grand_child (@{$child->{child_paths}}) {
            $grand_child->remove_as_child;
            push @array, $grand_child->flatten;
        }
    }
    return @array;
}

# Test whether the polygon really contains the offered child polygon
# In this case, it is accepted as a child.
# I fthe polygon contains children or grand children which in fact also contain the
# offered child, the child is put as the child of the most inner fitting polygon
# To reduce the polygons to thos only conataining one exterior ring and interioer rings which
# are empty, use the function flatten.
# Returns 1 if the
sub accept_as_child {
    my ($self, $child) = @_;

    my $parent_is_parent = 0;

    # primary test: the outer polygon contains the child
    if ($self->contains($child)) {

        # Test, whether also a child, grand-child ... contains the child.
        foreach my $other_child (@{$self->{child_paths}}) {
            if ($parent_is_parent = $other_child->accept_as_child($child)) {
                last;
            } else {
                $child->accept_as_child($other_child);
            };
        }

        # No child contain the child
        # thus set it as the child.
        if ($parent_is_parent == 0) {
            $child->set_as_child_of($self);
            $parent_is_parent = 1;
        }
    }
    return $parent_is_parent;
}

sub move_by {
    my ($self, $dx, $dy)=@_;
    $self->SUPER::move_by($dx, $dy);
    map {$_->move_by($dx, $dy)} @{$self->{child_paths}};
}

1;