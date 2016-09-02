#!/usr/bin/env bash

FILE_LIST=file_list
CLEAN_UP=1

# Check for filename argument
if [ -z $1 ]; then
  echo 'Syntax:'
  echo '    build_xpi.sh <filename>'
  exit
else
  XPI_FILE=$1
fi

# Clean up from previous invocations
rm -f $FILE_LIST *.xpi

# Build the file list
find . \( -path '*.svn*' -o \
          -path '*docs*' -o \
          -path '*api_docs*' -o \
          -path '*testsuite*' -o \
          -path '*tar*' -o \
          -path '*zip*' -o \
          -path '*md5*' -o \
          -path '*/openajax_a11y/nls/*' -o \
          -path '*/openajax_a11y/rules/*' -o \
          -path '*/openajax_a11y/rulesets/*' -o \
          -path '*/openajax_a11y/scripts/*' -o \
          -path '*/openajax_a11y/wai_aria/*' -o \
          -name '.DS_Store' -o \
          -name '.jshintrc' -o \
          -name 'build_xpi.sh' -o \
          -name 'make_*' -o \
          -name 'openajax_a11y_constants.js' -o \
          -name 'openajax_a11y.js' -o \
          -name $FILE_LIST \) -prune -o \
          -type f -print | grep -v \~ >> $FILE_LIST

# Create the XPI file
zip $XPI_FILE -@ < $FILE_LIST

# Cleanup
if [ $CLEAN_UP = 1 ]; then
    rm -f $FILE_LIST
fi
