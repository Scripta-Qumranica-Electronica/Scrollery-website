# This file should receive a GitHub tag as $ARGV[0].
# It should CWD to /home/bronson/Datafiles, then
# run git checkout followed by the tag name.
# Then re-run the script to copy the schema,
# the /tables folder, and the geom_tables folder
# into /tmp on the virtual machine.  Finally
# run the database install script, making sure to
# give the database the proper name (i.e., for tag
# 0.1.3 the database should be called SQE_DEV_0_1).
# We drop the last number of the version, since
# the latest increment should be backwards compatible.