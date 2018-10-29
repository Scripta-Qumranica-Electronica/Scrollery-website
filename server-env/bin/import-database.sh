#!/bin/bash
#TODO please add a warning that the database you are uploading to should not already exist on the server.

user="root"
password="$MYSQL_ROOT_PASSWORD"
host="$HOST"
database="$DATABASE"

if [ -z "$database" ]; then
   database="SQE_DEV"
fi

if [ -z "$host" ]; then
   host="localhost"
fi

cwd=$(pwd)
echo Creating DB ${database}
mysql --host=${host} --user=${user} --password=${password} -e "CREATE DATABASE IF NOT EXISTS ${database} DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci"

# TODO: Please check or add validation for actual schema file being imported.
echo Loading SQE DB Schema
mysql --host=${host} --user=${user} --password=${password} ${database} < /tmp/schema/SQE-Schema-current.sql &
pid=$! # Process Id of the previous running command

spin='-\|/'

i=0
while kill -0 $pid 2>/dev/null
do
  i=$(( (i+1) %4 ))
  printf "\r${spin:$i:1}"
  sleep .1
done

echo Creating Default Users
mysql --host=${host} --user=${user} --password=${password} -e "INSERT INTO ${database}.user (user_id, user_name, pw, forename, surname, organization, email, registration_date) VALUES (1,'sqe_api','d60cd26b03a4607dc6c1db2514bbf20e59f751c98157c474ebfbeff3',NULL,NULL,NULL,NULL,'2017-08-20 18:59:50'), (5,'test','7872a74bcbf298a1e77d507cd95d4f8d96131cbbd4cdfc571e776c8a',NULL,NULL,NULL,NULL,'2017-07-28 17:18:15')"

for file in /tmp/tables/*.sql.gz; do
    printf "\rExtracting table: ${cwd}/${file}\n"
    gunzip $file &
    pid=$! # Process Id of the previous running command

    while kill -0 $pid 2>/dev/null
    do
      i=$(( (i+1) %4 ))
      printf "\r${spin:$i:1}"
      sleep .1
    done
done

for file in /tmp/tables/*.sql; do
    table=${file%.sql}
    columns=$(head -n 1 "$cwd/$file")
    printf "\rLoading table: ${table##*/}\n"
    queryString="SET FOREIGN_KEY_CHECKS=0;
    LOAD DATA LOCAL INFILE '$file' INTO TABLE ${table##*/} FIELDS TERMINATED BY ',' IGNORE 1 LINES ($columns)"
    IFS=',' read -r -a columnList <<< "$columns"
    foundColumns=0
    for column in "${columnList[@]}"; do
      if [[ "${column}" = *"@"* ]]; then
        ((foundColumns++))
        if (($foundColumns > 1)); then
          queryString="$queryString, ${column:1} = ST_GEOMFROMTEXT(${column})"
        else
          queryString="$queryString SET ${column:1} = ST_GEOMFROMTEXT(${column})"
        fi
      fi
    done
    queryString="$queryString; SET FOREIGN_KEY_CHECKS=1;"
    mysql --host=${host} --user=${user} --password=${password} --local-infile ${database} -e "$queryString" &
    pid=$! # Process Id of the previous running command

    while kill -0 $pid 2>/dev/null
    do
      i=$(( (i+1) %4 ))
      printf "\r${spin:$i:1}"
      sleep .1
    done
done