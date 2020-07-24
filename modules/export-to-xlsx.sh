#!/usr/bin/zsh
SAVEIFS=$IFS
IFS=$(echo -en "\n\b")
for file in "../data/$1/stables"/*
do
  echo "$file"
  libreoffice --headless --convert-to xlsx --outdir "../data/$1/exports" $file
done
IFS=$SAVEIFS