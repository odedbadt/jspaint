#!/bin/sh
java -jar ~/bin/compiler.jar --js src/fixel closure/goog/ third_party_closure/goog/ --only_closure_dependencies --closure_entry_point=fixel.jspaint.SquarePaint --compilation_level ADVANCED_OPTIMIZATIONS --js_output_file ./bin/all.js
