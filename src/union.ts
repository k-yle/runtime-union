import ts from 'typescript';

function findTypeAlias(
  node: ts.Node,
  typeName: string,
): ts.TypeAliasDeclaration | undefined {
  if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
    return node;
  }

  let foundNode: ts.TypeAliasDeclaration | undefined;

  ts.forEachChild(node, (childNode) => {
    foundNode ||= findTypeAlias(childNode, typeName);
  });

  return foundNode;
}

const isTemplateLiteralType = (type: ts.Type): type is ts.TemplateLiteralType =>
  !!(type.flags & ts.TypeFlags.TemplateLiteral);

function handleUnionMember(subType: ts.Type) {
  // this case should not be possible
  if (subType.symbol?.name) return subType.symbol.name;

  // if it's a literal string with no variables
  if (subType.isStringLiteral()) return subType.value;

  // if it's a template literal type (cf. a template literal string)
  if (isTemplateLiteralType(subType)) return subType.texts?.join('*');

  console.warn("didn't understand string union member");
  if (process.argv.includes('--verbose')) console.log(subType);

  return '';
}

/**
 * @param filePath - abosolute path to the file
 * @param typeAliasName - the name of the type alias to extract. Does not have to be exported.
 */
export function evaluateStringUnion(
  filePath: string,
  typeAliasName: string,
  tsConfig: ts.CompilerOptions = {},
) {
  const program = ts.createProgram([filePath], tsConfig);
  const sourceFile = program.getSourceFile(filePath);

  if (!sourceFile) {
    throw new Error(
      `File ${filePath} not found or not included in the TypeScript program.`,
    );
  }

  const typeChecker = program.getTypeChecker();
  const typeNode = findTypeAlias(sourceFile, typeAliasName);

  if (!typeNode) throw new Error('Type not found');

  const type = typeChecker.getTypeAtLocation(typeNode);

  const typeContents: string[] = [];

  if (type.isUnion() || type.isIntersection()) {
    for (const subType of type.types) {
      typeContents.push(handleUnionMember(subType));
    }
  } else {
    typeContents.push(handleUnionMember(type));
  }

  return typeContents;
}
