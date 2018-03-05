# Add code to check the folder /var/www/html/development/SQE_API
# for a folder corresponding to the first two version numbers
# of the tag passed in as $ARGV[0] (i.e., folder 0_1 for tag 0.1.34).
# If it does not exist, run a `git clone` to create it.  In either
# case, then CWD to that new folder and run `git checkout` followed
# by the tag you received from $ARGV[0].