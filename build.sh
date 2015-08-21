#!/bin/sh
#java -jar ~/bin/compiler.jar --js src closure/goog --compilation_level ADVANCED_OPTIMIZATIONS --warning_level=VERBOSE --js_output_file out.js
./closure/bin/build/closurebuilder.py \
  --root=closure/goog/ \
  --root=third_party_closure/goog/ \
  --root=src/ \
  --namespace=mask \
  --namespace=jspaint.exports \
  --namespace=jspaint.SquarePaint \
  --output_mode=compiled \
  --compiler_jar=/home/oded/bin/compiler.jar > bin/all.js
