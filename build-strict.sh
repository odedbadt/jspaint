
java -jar ~/bin/compiler.jar --js src/fixel closure/goog/ third_party_closure/goog/  --generate_exports --only_closure_dependencies --closure_entry_point=fixel.jspaint.SquarePaint --compilation_level ADVANCED_OPTIMIZATIONS --create_source_map ./source_map.map --source_map_format V3 --js_output_file ./bin/all.js  --warning_level=VERBOSE \
  --jscomp_error=accessControls \
  --jscomp_error=checkDebuggerStatement \
  --jscomp_error=checkEventfulObjectDisposal \
  --jscomp_error=checkRegExp \
  --jscomp_error=checkTypes \
  --jscomp_error=conformanceViolations \
  --jscomp_error=constantProperty \
  --jscomp_error=const \
  --jscomp_error=deprecatedAnnotations \
  --jscomp_error=deprecated \
  --jscomp_error=externsValidation \
  --jscomp_error=extraRequire \
  --jscomp_error=fileoverviewTags \
  --jscomp_error=globalThis \
  --jscomp_error=inferredConstCheck \
  --jscomp_error=internetExplorerChecks \
  --jscomp_error=invalidCasts \
  --jscomp_error=misplacedTypeAnnotation \
  --jscomp_error=missingGetCssName \
  --jscomp_error=missingProperties \
  --jscomp_error=missingProvide \
  --jscomp_error=missingRequire \
  --jscomp_error=missingReturn \
  --jscomp_error=newCheckTypes \
  --jscomp_error=nonStandardJsDocs \
  --jscomp_error=strictModuleDepCheck \
  --jscomp_error=suspiciousCode \
  --jscomp_error=tweakValidation \
  --jscomp_error=typeInvalidation \
  --jscomp_error=undefinedNames \
  --jscomp_error=unknownDefines \
  --jscomp_error=useOfGoogBase \
  --jscomp_error=uselessCode \
  --jscomp_error=visibility \
  --js_output_file bin/all.js
