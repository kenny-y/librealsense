#!/bin/bash

#Usage: gen-dist.sh xxxx.tar.gz

WORKDIR=`mktemp -d`
RAWMODULEDIR="node-librealsense"
MODULEDIR="$WORKDIR/$RAWMODULEDIR"
RSDIR="$MODULEDIR/librealsense"
TARFILENAME="$WORKDIR/$1"

mkdir -p $RSDIR
rsync -a ../.. $RSDIR --exclude wrappers --exclude doc --exclude unit-tests --exclude build --exclude .git
rsync -a . $MODULEDIR --exclude build --exclude dist --exclude node_modules

cp -f scripts/npm_dist/binding.gyp $MODULEDIR
cp -f scripts/npm_dist/package.json $MODULEDIR

pushd . > /dev/null
cd $WORKDIR
tar -czf $1 $RAWMODULEDIR

### TEMP: SHOW INFO & DIR
#echo $TARFILENAME
#gnome-open $WORKDIR

popd > /dev/null
mkdir -p dist
cp -f $TARFILENAME ./dist/
rm -rf $WORKDIR
#gnome-open ./dist
