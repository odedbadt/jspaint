#!/bin/sh
#java -jar ~/bin/compiler.jar --js src closure/goog --compilation_level ADVANCED_OPTIMIZATIONS --warning_level=VERBOSE --js_output_file out.js
./closure/bin/build/closurebuilder.py \
  --root=closure/ \
  --root=src/ \
  --namespace=mask.Mask \
  --output_mode=compiled \
  --compiler_jar=~/bin/compiler.jar > out.js
