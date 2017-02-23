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
find . \( -path '*.git*' -o \
          -path '*docs*' -o \
          -name '.DS_Store' -o \
          -name '.jshintrc' -o \
          -name 'build_xpi.sh' -o \
          -name 'README.md' -o \
          -name $FILE_LIST \) -prune -o \
          -type f -print | grep -v \~ >> $FILE_LIST

# Create the XPI file
zip $XPI_FILE -@ < $FILE_LIST

# Cleanup
if [ $CLEAN_UP = 1 ]; then
    rm -f $FILE_LIST
fi
