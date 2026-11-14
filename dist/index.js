// @bun
// src/index.ts
import { randomUUID as randomUUID2 } from "crypto";
import * as path3 from "path";
import {
  getAgentDir
} from "@oh-my-pi/pi-coding-agent";
// node_modules/graphql/jsutils/devAssert.mjs
function devAssert(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message);
  }
}

// node_modules/graphql/jsutils/inspect.mjs
var MAX_ARRAY_LENGTH = 10;
var MAX_RECURSIVE_DEPTH = 2;
function inspect(value) {
  return formatValue(value, []);
}
function formatValue(value, seenValues) {
  switch (typeof value) {
    case "string":
      return JSON.stringify(value);
    case "function":
      return value.name ? `[function ${value.name}]` : "[function]";
    case "object":
      return formatObjectValue(value, seenValues);
    default:
      return String(value);
  }
}
function formatObjectValue(value, previouslySeenValues) {
  if (value === null) {
    return "null";
  }
  if (previouslySeenValues.includes(value)) {
    return "[Circular]";
  }
  const seenValues = [...previouslySeenValues, value];
  if (isJSONable(value)) {
    const jsonValue = value.toJSON();
    if (jsonValue !== value) {
      return typeof jsonValue === "string" ? jsonValue : formatValue(jsonValue, seenValues);
    }
  } else if (Array.isArray(value)) {
    return formatArray(value, seenValues);
  }
  return formatObject(value, seenValues);
}
function isJSONable(value) {
  return typeof value.toJSON === "function";
}
function formatObject(object, seenValues) {
  const entries = Object.entries(object);
  if (entries.length === 0) {
    return "{}";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[" + getObjectTag(object) + "]";
  }
  const properties = entries.map(([key, value]) => key + ": " + formatValue(value, seenValues));
  return "{ " + properties.join(", ") + " }";
}
function formatArray(array, seenValues) {
  if (array.length === 0) {
    return "[]";
  }
  if (seenValues.length > MAX_RECURSIVE_DEPTH) {
    return "[Array]";
  }
  const len = Math.min(MAX_ARRAY_LENGTH, array.length);
  const remaining = array.length - len;
  const items = [];
  for (let i = 0;i < len; ++i) {
    items.push(formatValue(array[i], seenValues));
  }
  if (remaining === 1) {
    items.push("... 1 more item");
  } else if (remaining > 1) {
    items.push(`... ${remaining} more items`);
  }
  return "[" + items.join(", ") + "]";
}
function getObjectTag(object) {
  const tag = Object.prototype.toString.call(object).replace(/^\[object /, "").replace(/]$/, "");
  if (tag === "Object" && typeof object.constructor === "function") {
    const name = object.constructor.name;
    if (typeof name === "string" && name !== "") {
      return name;
    }
  }
  return tag;
}

// node_modules/graphql/jsutils/instanceOf.mjs
var isProduction = globalThis.process && false;
var instanceOf = isProduction ? function instanceOf(value, constructor) {
  return value instanceof constructor;
} : function instanceOf(value, constructor) {
  if (value instanceof constructor) {
    return true;
  }
  if (typeof value === "object" && value !== null) {
    var _value$constructor;
    const className = constructor.prototype[Symbol.toStringTag];
    const valueClassName = Symbol.toStringTag in value ? value[Symbol.toStringTag] : (_value$constructor = value.constructor) === null || _value$constructor === undefined ? undefined : _value$constructor.name;
    if (className === valueClassName) {
      const stringifiedValue = inspect(value);
      throw new Error(`Cannot use ${className} "${stringifiedValue}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`);
    }
  }
  return false;
};

// node_modules/graphql/jsutils/isObjectLike.mjs
function isObjectLike(value) {
  return typeof value == "object" && value !== null;
}

// node_modules/graphql/jsutils/toObjMap.mjs
function toObjMap(obj) {
  if (obj == null) {
    return Object.create(null);
  }
  if (Object.getPrototypeOf(obj) === null) {
    return obj;
  }
  const map = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    map[key] = value;
  }
  return map;
}

// node_modules/graphql/language/ast.mjs
class Location {
  constructor(startToken, endToken, source) {
    this.start = startToken.start;
    this.end = endToken.end;
    this.startToken = startToken;
    this.endToken = endToken;
    this.source = source;
  }
  get [Symbol.toStringTag]() {
    return "Location";
  }
  toJSON() {
    return {
      start: this.start,
      end: this.end
    };
  }
}

class Token {
  constructor(kind, start, end, line, column, value) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value;
    this.prev = null;
    this.next = null;
  }
  get [Symbol.toStringTag]() {
    return "Token";
  }
  toJSON() {
    return {
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column
    };
  }
}
var QueryDocumentKeys = {
  Name: [],
  Document: ["definitions"],
  OperationDefinition: [
    "name",
    "variableDefinitions",
    "directives",
    "selectionSet"
  ],
  VariableDefinition: ["variable", "type", "defaultValue", "directives"],
  Variable: ["name"],
  SelectionSet: ["selections"],
  Field: ["alias", "name", "arguments", "directives", "selectionSet"],
  Argument: ["name", "value"],
  FragmentSpread: ["name", "directives"],
  InlineFragment: ["typeCondition", "directives", "selectionSet"],
  FragmentDefinition: [
    "name",
    "variableDefinitions",
    "typeCondition",
    "directives",
    "selectionSet"
  ],
  IntValue: [],
  FloatValue: [],
  StringValue: [],
  BooleanValue: [],
  NullValue: [],
  EnumValue: [],
  ListValue: ["values"],
  ObjectValue: ["fields"],
  ObjectField: ["name", "value"],
  Directive: ["name", "arguments"],
  NamedType: ["name"],
  ListType: ["type"],
  NonNullType: ["type"],
  SchemaDefinition: ["description", "directives", "operationTypes"],
  OperationTypeDefinition: ["type"],
  ScalarTypeDefinition: ["description", "name", "directives"],
  ObjectTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  FieldDefinition: ["description", "name", "arguments", "type", "directives"],
  InputValueDefinition: [
    "description",
    "name",
    "type",
    "defaultValue",
    "directives"
  ],
  InterfaceTypeDefinition: [
    "description",
    "name",
    "interfaces",
    "directives",
    "fields"
  ],
  UnionTypeDefinition: ["description", "name", "directives", "types"],
  EnumTypeDefinition: ["description", "name", "directives", "values"],
  EnumValueDefinition: ["description", "name", "directives"],
  InputObjectTypeDefinition: ["description", "name", "directives", "fields"],
  DirectiveDefinition: ["description", "name", "arguments", "locations"],
  SchemaExtension: ["directives", "operationTypes"],
  ScalarTypeExtension: ["name", "directives"],
  ObjectTypeExtension: ["name", "interfaces", "directives", "fields"],
  InterfaceTypeExtension: ["name", "interfaces", "directives", "fields"],
  UnionTypeExtension: ["name", "directives", "types"],
  EnumTypeExtension: ["name", "directives", "values"],
  InputObjectTypeExtension: ["name", "directives", "fields"]
};
var kindValues = new Set(Object.keys(QueryDocumentKeys));
function isNode(maybeNode) {
  const maybeKind = maybeNode === null || maybeNode === undefined ? undefined : maybeNode.kind;
  return typeof maybeKind === "string" && kindValues.has(maybeKind);
}
var OperationTypeNode;
(function(OperationTypeNode) {
  OperationTypeNode["QUERY"] = "query";
  OperationTypeNode["MUTATION"] = "mutation";
  OperationTypeNode["SUBSCRIPTION"] = "subscription";
})(OperationTypeNode || (OperationTypeNode = {}));

// node_modules/graphql/jsutils/didYouMean.mjs
var MAX_SUGGESTIONS = 5;
function didYouMean(firstArg, secondArg) {
  const [subMessage, suggestionsArg] = secondArg ? [firstArg, secondArg] : [undefined, firstArg];
  let message = " Did you mean ";
  if (subMessage) {
    message += subMessage + " ";
  }
  const suggestions = suggestionsArg.map((x) => `"${x}"`);
  switch (suggestions.length) {
    case 0:
      return "";
    case 1:
      return message + suggestions[0] + "?";
    case 2:
      return message + suggestions[0] + " or " + suggestions[1] + "?";
  }
  const selected = suggestions.slice(0, MAX_SUGGESTIONS);
  const lastItem = selected.pop();
  return message + selected.join(", ") + ", or " + lastItem + "?";
}

// node_modules/graphql/jsutils/identityFunc.mjs
function identityFunc(x) {
  return x;
}

// node_modules/graphql/jsutils/keyMap.mjs
function keyMap(list, keyFn) {
  const result = Object.create(null);
  for (const item of list) {
    result[keyFn(item)] = item;
  }
  return result;
}

// node_modules/graphql/jsutils/keyValMap.mjs
function keyValMap(list, keyFn, valFn) {
  const result = Object.create(null);
  for (const item of list) {
    result[keyFn(item)] = valFn(item);
  }
  return result;
}

// node_modules/graphql/jsutils/mapValue.mjs
function mapValue(map, fn) {
  const result = Object.create(null);
  for (const key of Object.keys(map)) {
    result[key] = fn(map[key], key);
  }
  return result;
}

// node_modules/graphql/jsutils/naturalCompare.mjs
function naturalCompare(aStr, bStr) {
  let aIndex = 0;
  let bIndex = 0;
  while (aIndex < aStr.length && bIndex < bStr.length) {
    let aChar = aStr.charCodeAt(aIndex);
    let bChar = bStr.charCodeAt(bIndex);
    if (isDigit(aChar) && isDigit(bChar)) {
      let aNum = 0;
      do {
        ++aIndex;
        aNum = aNum * 10 + aChar - DIGIT_0;
        aChar = aStr.charCodeAt(aIndex);
      } while (isDigit(aChar) && aNum > 0);
      let bNum = 0;
      do {
        ++bIndex;
        bNum = bNum * 10 + bChar - DIGIT_0;
        bChar = bStr.charCodeAt(bIndex);
      } while (isDigit(bChar) && bNum > 0);
      if (aNum < bNum) {
        return -1;
      }
      if (aNum > bNum) {
        return 1;
      }
    } else {
      if (aChar < bChar) {
        return -1;
      }
      if (aChar > bChar) {
        return 1;
      }
      ++aIndex;
      ++bIndex;
    }
  }
  return aStr.length - bStr.length;
}
var DIGIT_0 = 48;
var DIGIT_9 = 57;
function isDigit(code) {
  return !isNaN(code) && DIGIT_0 <= code && code <= DIGIT_9;
}

// node_modules/graphql/jsutils/suggestionList.mjs
function suggestionList(input, options) {
  const optionsByDistance = Object.create(null);
  const lexicalDistance = new LexicalDistance(input);
  const threshold = Math.floor(input.length * 0.4) + 1;
  for (const option of options) {
    const distance = lexicalDistance.measure(option, threshold);
    if (distance !== undefined) {
      optionsByDistance[option] = distance;
    }
  }
  return Object.keys(optionsByDistance).sort((a, b) => {
    const distanceDiff = optionsByDistance[a] - optionsByDistance[b];
    return distanceDiff !== 0 ? distanceDiff : naturalCompare(a, b);
  });
}

class LexicalDistance {
  constructor(input) {
    this._input = input;
    this._inputLowerCase = input.toLowerCase();
    this._inputArray = stringToArray(this._inputLowerCase);
    this._rows = [
      new Array(input.length + 1).fill(0),
      new Array(input.length + 1).fill(0),
      new Array(input.length + 1).fill(0)
    ];
  }
  measure(option, threshold) {
    if (this._input === option) {
      return 0;
    }
    const optionLowerCase = option.toLowerCase();
    if (this._inputLowerCase === optionLowerCase) {
      return 1;
    }
    let a = stringToArray(optionLowerCase);
    let b = this._inputArray;
    if (a.length < b.length) {
      const tmp = a;
      a = b;
      b = tmp;
    }
    const aLength = a.length;
    const bLength = b.length;
    if (aLength - bLength > threshold) {
      return;
    }
    const rows = this._rows;
    for (let j = 0;j <= bLength; j++) {
      rows[0][j] = j;
    }
    for (let i = 1;i <= aLength; i++) {
      const upRow = rows[(i - 1) % 3];
      const currentRow = rows[i % 3];
      let smallestCell = currentRow[0] = i;
      for (let j = 1;j <= bLength; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let currentCell = Math.min(upRow[j] + 1, currentRow[j - 1] + 1, upRow[j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          const doubleDiagonalCell = rows[(i - 2) % 3][j - 2];
          currentCell = Math.min(currentCell, doubleDiagonalCell + 1);
        }
        if (currentCell < smallestCell) {
          smallestCell = currentCell;
        }
        currentRow[j] = currentCell;
      }
      if (smallestCell > threshold) {
        return;
      }
    }
    const distance = rows[aLength % 3][bLength];
    return distance <= threshold ? distance : undefined;
  }
}
function stringToArray(str) {
  const strLength = str.length;
  const array = new Array(strLength);
  for (let i = 0;i < strLength; ++i) {
    array[i] = str.charCodeAt(i);
  }
  return array;
}

// node_modules/graphql/jsutils/invariant.mjs
function invariant(condition, message) {
  const booleanCondition = Boolean(condition);
  if (!booleanCondition) {
    throw new Error(message != null ? message : "Unexpected invariant triggered.");
  }
}

// node_modules/graphql/language/location.mjs
var LineRegExp = /\r\n|[\n\r]/g;
function getLocation(source, position) {
  let lastLineStart = 0;
  let line = 1;
  for (const match of source.body.matchAll(LineRegExp)) {
    typeof match.index === "number" || invariant(false);
    if (match.index >= position) {
      break;
    }
    lastLineStart = match.index + match[0].length;
    line += 1;
  }
  return {
    line,
    column: position + 1 - lastLineStart
  };
}

// node_modules/graphql/language/printLocation.mjs
function printLocation(location) {
  return printSourceLocation(location.source, getLocation(location.source, location.start));
}
function printSourceLocation(source, sourceLocation) {
  const firstLineColumnOffset = source.locationOffset.column - 1;
  const body = "".padStart(firstLineColumnOffset) + source.body;
  const lineIndex = sourceLocation.line - 1;
  const lineOffset = source.locationOffset.line - 1;
  const lineNum = sourceLocation.line + lineOffset;
  const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
  const columnNum = sourceLocation.column + columnOffset;
  const locationStr = `${source.name}:${lineNum}:${columnNum}
`;
  const lines = body.split(/\r\n|[\n\r]/g);
  const locationLine = lines[lineIndex];
  if (locationLine.length > 120) {
    const subLineIndex = Math.floor(columnNum / 80);
    const subLineColumnNum = columnNum % 80;
    const subLines = [];
    for (let i = 0;i < locationLine.length; i += 80) {
      subLines.push(locationLine.slice(i, i + 80));
    }
    return locationStr + printPrefixedLines([
      [`${lineNum} |`, subLines[0]],
      ...subLines.slice(1, subLineIndex + 1).map((subLine) => ["|", subLine]),
      ["|", "^".padStart(subLineColumnNum)],
      ["|", subLines[subLineIndex + 1]]
    ]);
  }
  return locationStr + printPrefixedLines([
    [`${lineNum - 1} |`, lines[lineIndex - 1]],
    [`${lineNum} |`, locationLine],
    ["|", "^".padStart(columnNum)],
    [`${lineNum + 1} |`, lines[lineIndex + 1]]
  ]);
}
function printPrefixedLines(lines) {
  const existingLines = lines.filter(([_, line]) => line !== undefined);
  const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
  return existingLines.map(([prefix, line]) => prefix.padStart(padLen) + (line ? " " + line : "")).join(`
`);
}

// node_modules/graphql/error/GraphQLError.mjs
function toNormalizedOptions(args) {
  const firstArg = args[0];
  if (firstArg == null || "kind" in firstArg || "length" in firstArg) {
    return {
      nodes: firstArg,
      source: args[1],
      positions: args[2],
      path: args[3],
      originalError: args[4],
      extensions: args[5]
    };
  }
  return firstArg;
}

class GraphQLError extends Error {
  constructor(message, ...rawArgs) {
    var _this$nodes, _nodeLocations$, _ref;
    const { nodes, source, positions, path, originalError, extensions } = toNormalizedOptions(rawArgs);
    super(message);
    this.name = "GraphQLError";
    this.path = path !== null && path !== undefined ? path : undefined;
    this.originalError = originalError !== null && originalError !== undefined ? originalError : undefined;
    this.nodes = undefinedIfEmpty(Array.isArray(nodes) ? nodes : nodes ? [nodes] : undefined);
    const nodeLocations = undefinedIfEmpty((_this$nodes = this.nodes) === null || _this$nodes === undefined ? undefined : _this$nodes.map((node) => node.loc).filter((loc) => loc != null));
    this.source = source !== null && source !== undefined ? source : nodeLocations === null || nodeLocations === undefined ? undefined : (_nodeLocations$ = nodeLocations[0]) === null || _nodeLocations$ === undefined ? undefined : _nodeLocations$.source;
    this.positions = positions !== null && positions !== undefined ? positions : nodeLocations === null || nodeLocations === undefined ? undefined : nodeLocations.map((loc) => loc.start);
    this.locations = positions && source ? positions.map((pos) => getLocation(source, pos)) : nodeLocations === null || nodeLocations === undefined ? undefined : nodeLocations.map((loc) => getLocation(loc.source, loc.start));
    const originalExtensions = isObjectLike(originalError === null || originalError === undefined ? undefined : originalError.extensions) ? originalError === null || originalError === undefined ? undefined : originalError.extensions : undefined;
    this.extensions = (_ref = extensions !== null && extensions !== undefined ? extensions : originalExtensions) !== null && _ref !== undefined ? _ref : Object.create(null);
    Object.defineProperties(this, {
      message: {
        writable: true,
        enumerable: true
      },
      name: {
        enumerable: false
      },
      nodes: {
        enumerable: false
      },
      source: {
        enumerable: false
      },
      positions: {
        enumerable: false
      },
      originalError: {
        enumerable: false
      }
    });
    if (originalError !== null && originalError !== undefined && originalError.stack) {
      Object.defineProperty(this, "stack", {
        value: originalError.stack,
        writable: true,
        configurable: true
      });
    } else if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphQLError);
    } else {
      Object.defineProperty(this, "stack", {
        value: Error().stack,
        writable: true,
        configurable: true
      });
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLError";
  }
  toString() {
    let output = this.message;
    if (this.nodes) {
      for (const node of this.nodes) {
        if (node.loc) {
          output += `

` + printLocation(node.loc);
        }
      }
    } else if (this.source && this.locations) {
      for (const location of this.locations) {
        output += `

` + printSourceLocation(this.source, location);
      }
    }
    return output;
  }
  toJSON() {
    const formattedError = {
      message: this.message
    };
    if (this.locations != null) {
      formattedError.locations = this.locations;
    }
    if (this.path != null) {
      formattedError.path = this.path;
    }
    if (this.extensions != null && Object.keys(this.extensions).length > 0) {
      formattedError.extensions = this.extensions;
    }
    return formattedError;
  }
}
function undefinedIfEmpty(array) {
  return array === undefined || array.length === 0 ? undefined : array;
}

// node_modules/graphql/language/kinds.mjs
var Kind;
(function(Kind) {
  Kind["NAME"] = "Name";
  Kind["DOCUMENT"] = "Document";
  Kind["OPERATION_DEFINITION"] = "OperationDefinition";
  Kind["VARIABLE_DEFINITION"] = "VariableDefinition";
  Kind["SELECTION_SET"] = "SelectionSet";
  Kind["FIELD"] = "Field";
  Kind["ARGUMENT"] = "Argument";
  Kind["FRAGMENT_SPREAD"] = "FragmentSpread";
  Kind["INLINE_FRAGMENT"] = "InlineFragment";
  Kind["FRAGMENT_DEFINITION"] = "FragmentDefinition";
  Kind["VARIABLE"] = "Variable";
  Kind["INT"] = "IntValue";
  Kind["FLOAT"] = "FloatValue";
  Kind["STRING"] = "StringValue";
  Kind["BOOLEAN"] = "BooleanValue";
  Kind["NULL"] = "NullValue";
  Kind["ENUM"] = "EnumValue";
  Kind["LIST"] = "ListValue";
  Kind["OBJECT"] = "ObjectValue";
  Kind["OBJECT_FIELD"] = "ObjectField";
  Kind["DIRECTIVE"] = "Directive";
  Kind["NAMED_TYPE"] = "NamedType";
  Kind["LIST_TYPE"] = "ListType";
  Kind["NON_NULL_TYPE"] = "NonNullType";
  Kind["SCHEMA_DEFINITION"] = "SchemaDefinition";
  Kind["OPERATION_TYPE_DEFINITION"] = "OperationTypeDefinition";
  Kind["SCALAR_TYPE_DEFINITION"] = "ScalarTypeDefinition";
  Kind["OBJECT_TYPE_DEFINITION"] = "ObjectTypeDefinition";
  Kind["FIELD_DEFINITION"] = "FieldDefinition";
  Kind["INPUT_VALUE_DEFINITION"] = "InputValueDefinition";
  Kind["INTERFACE_TYPE_DEFINITION"] = "InterfaceTypeDefinition";
  Kind["UNION_TYPE_DEFINITION"] = "UnionTypeDefinition";
  Kind["ENUM_TYPE_DEFINITION"] = "EnumTypeDefinition";
  Kind["ENUM_VALUE_DEFINITION"] = "EnumValueDefinition";
  Kind["INPUT_OBJECT_TYPE_DEFINITION"] = "InputObjectTypeDefinition";
  Kind["DIRECTIVE_DEFINITION"] = "DirectiveDefinition";
  Kind["SCHEMA_EXTENSION"] = "SchemaExtension";
  Kind["SCALAR_TYPE_EXTENSION"] = "ScalarTypeExtension";
  Kind["OBJECT_TYPE_EXTENSION"] = "ObjectTypeExtension";
  Kind["INTERFACE_TYPE_EXTENSION"] = "InterfaceTypeExtension";
  Kind["UNION_TYPE_EXTENSION"] = "UnionTypeExtension";
  Kind["ENUM_TYPE_EXTENSION"] = "EnumTypeExtension";
  Kind["INPUT_OBJECT_TYPE_EXTENSION"] = "InputObjectTypeExtension";
})(Kind || (Kind = {}));

// node_modules/graphql/language/characterClasses.mjs
function isWhiteSpace(code) {
  return code === 9 || code === 32;
}
function isDigit2(code) {
  return code >= 48 && code <= 57;
}
function isLetter(code) {
  return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function isNameStart(code) {
  return isLetter(code) || code === 95;
}
function isNameContinue(code) {
  return isLetter(code) || isDigit2(code) || code === 95;
}

// node_modules/graphql/language/blockString.mjs
function dedentBlockStringLines(lines) {
  var _firstNonEmptyLine2;
  let commonIndent = Number.MAX_SAFE_INTEGER;
  let firstNonEmptyLine = null;
  let lastNonEmptyLine = -1;
  for (let i = 0;i < lines.length; ++i) {
    var _firstNonEmptyLine;
    const line = lines[i];
    const indent = leadingWhitespace(line);
    if (indent === line.length) {
      continue;
    }
    firstNonEmptyLine = (_firstNonEmptyLine = firstNonEmptyLine) !== null && _firstNonEmptyLine !== undefined ? _firstNonEmptyLine : i;
    lastNonEmptyLine = i;
    if (i !== 0 && indent < commonIndent) {
      commonIndent = indent;
    }
  }
  return lines.map((line, i) => i === 0 ? line : line.slice(commonIndent)).slice((_firstNonEmptyLine2 = firstNonEmptyLine) !== null && _firstNonEmptyLine2 !== undefined ? _firstNonEmptyLine2 : 0, lastNonEmptyLine + 1);
}
function leadingWhitespace(str) {
  let i = 0;
  while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
    ++i;
  }
  return i;
}
function printBlockString(value, options) {
  const escapedValue = value.replace(/"""/g, '\\"""');
  const lines = escapedValue.split(/\r\n|[\n\r]/g);
  const isSingleLine = lines.length === 1;
  const forceLeadingNewLine = lines.length > 1 && lines.slice(1).every((line) => line.length === 0 || isWhiteSpace(line.charCodeAt(0)));
  const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""');
  const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
  const hasTrailingSlash = value.endsWith("\\");
  const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
  const printAsMultipleLines = !(options !== null && options !== undefined && options.minimize) && (!isSingleLine || value.length > 70 || forceTrailingNewline || forceLeadingNewLine || hasTrailingTripleQuotes);
  let result = "";
  const skipLeadingNewLine = isSingleLine && isWhiteSpace(value.charCodeAt(0));
  if (printAsMultipleLines && !skipLeadingNewLine || forceLeadingNewLine) {
    result += `
`;
  }
  result += escapedValue;
  if (printAsMultipleLines || forceTrailingNewline) {
    result += `
`;
  }
  return '"""' + result + '"""';
}

// node_modules/graphql/language/printString.mjs
function printString(str) {
  return `"${str.replace(escapedRegExp, escapedReplacer)}"`;
}
var escapedRegExp = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;
function escapedReplacer(str) {
  return escapeSequences[str.charCodeAt(0)];
}
var escapeSequences = [
  "\\u0000",
  "\\u0001",
  "\\u0002",
  "\\u0003",
  "\\u0004",
  "\\u0005",
  "\\u0006",
  "\\u0007",
  "\\b",
  "\\t",
  "\\n",
  "\\u000B",
  "\\f",
  "\\r",
  "\\u000E",
  "\\u000F",
  "\\u0010",
  "\\u0011",
  "\\u0012",
  "\\u0013",
  "\\u0014",
  "\\u0015",
  "\\u0016",
  "\\u0017",
  "\\u0018",
  "\\u0019",
  "\\u001A",
  "\\u001B",
  "\\u001C",
  "\\u001D",
  "\\u001E",
  "\\u001F",
  "",
  "",
  "\\\"",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\\\",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "\\u007F",
  "\\u0080",
  "\\u0081",
  "\\u0082",
  "\\u0083",
  "\\u0084",
  "\\u0085",
  "\\u0086",
  "\\u0087",
  "\\u0088",
  "\\u0089",
  "\\u008A",
  "\\u008B",
  "\\u008C",
  "\\u008D",
  "\\u008E",
  "\\u008F",
  "\\u0090",
  "\\u0091",
  "\\u0092",
  "\\u0093",
  "\\u0094",
  "\\u0095",
  "\\u0096",
  "\\u0097",
  "\\u0098",
  "\\u0099",
  "\\u009A",
  "\\u009B",
  "\\u009C",
  "\\u009D",
  "\\u009E",
  "\\u009F"
];

// node_modules/graphql/language/visitor.mjs
var BREAK = Object.freeze({});
function visit(root, visitor, visitorKeys = QueryDocumentKeys) {
  const enterLeaveMap = new Map;
  for (const kind of Object.values(Kind)) {
    enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
  }
  let stack = undefined;
  let inArray = Array.isArray(root);
  let keys = [root];
  let index = -1;
  let edits = [];
  let node = root;
  let key = undefined;
  let parent = undefined;
  const path = [];
  const ancestors = [];
  do {
    index++;
    const isLeaving = index === keys.length;
    const isEdited = isLeaving && edits.length !== 0;
    if (isLeaving) {
      key = ancestors.length === 0 ? undefined : path[path.length - 1];
      node = parent;
      parent = ancestors.pop();
      if (isEdited) {
        if (inArray) {
          node = node.slice();
          let editOffset = 0;
          for (const [editKey, editValue] of edits) {
            const arrayKey = editKey - editOffset;
            if (editValue === null) {
              node.splice(arrayKey, 1);
              editOffset++;
            } else {
              node[arrayKey] = editValue;
            }
          }
        } else {
          node = { ...node };
          for (const [editKey, editValue] of edits) {
            node[editKey] = editValue;
          }
        }
      }
      index = stack.index;
      keys = stack.keys;
      edits = stack.edits;
      inArray = stack.inArray;
      stack = stack.prev;
    } else if (parent) {
      key = inArray ? index : keys[index];
      node = parent[key];
      if (node === null || node === undefined) {
        continue;
      }
      path.push(key);
    }
    let result;
    if (!Array.isArray(node)) {
      var _enterLeaveMap$get, _enterLeaveMap$get2;
      isNode(node) || devAssert(false, `Invalid AST Node: ${inspect(node)}.`);
      const visitFn = isLeaving ? (_enterLeaveMap$get = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get === undefined ? undefined : _enterLeaveMap$get.leave : (_enterLeaveMap$get2 = enterLeaveMap.get(node.kind)) === null || _enterLeaveMap$get2 === undefined ? undefined : _enterLeaveMap$get2.enter;
      result = visitFn === null || visitFn === undefined ? undefined : visitFn.call(visitor, node, key, parent, path, ancestors);
      if (result === BREAK) {
        break;
      }
      if (result === false) {
        if (!isLeaving) {
          path.pop();
          continue;
        }
      } else if (result !== undefined) {
        edits.push([key, result]);
        if (!isLeaving) {
          if (isNode(result)) {
            node = result;
          } else {
            path.pop();
            continue;
          }
        }
      }
    }
    if (result === undefined && isEdited) {
      edits.push([key, node]);
    }
    if (isLeaving) {
      path.pop();
    } else {
      var _node$kind;
      stack = {
        inArray,
        index,
        keys,
        edits,
        prev: stack
      };
      inArray = Array.isArray(node);
      keys = inArray ? node : (_node$kind = visitorKeys[node.kind]) !== null && _node$kind !== undefined ? _node$kind : [];
      index = -1;
      edits = [];
      if (parent) {
        ancestors.push(parent);
      }
      parent = node;
    }
  } while (stack !== undefined);
  if (edits.length !== 0) {
    return edits[edits.length - 1][1];
  }
  return root;
}
function visitInParallel(visitors) {
  const skipping = new Array(visitors.length).fill(null);
  const mergedVisitor = Object.create(null);
  for (const kind of Object.values(Kind)) {
    let hasVisitor = false;
    const enterList = new Array(visitors.length).fill(undefined);
    const leaveList = new Array(visitors.length).fill(undefined);
    for (let i = 0;i < visitors.length; ++i) {
      const { enter, leave } = getEnterLeaveForKind(visitors[i], kind);
      hasVisitor || (hasVisitor = enter != null || leave != null);
      enterList[i] = enter;
      leaveList[i] = leave;
    }
    if (!hasVisitor) {
      continue;
    }
    const mergedEnterLeave = {
      enter(...args) {
        const node = args[0];
        for (let i = 0;i < visitors.length; i++) {
          if (skipping[i] === null) {
            var _enterList$i;
            const result = (_enterList$i = enterList[i]) === null || _enterList$i === undefined ? undefined : _enterList$i.apply(visitors[i], args);
            if (result === false) {
              skipping[i] = node;
            } else if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== undefined) {
              return result;
            }
          }
        }
      },
      leave(...args) {
        const node = args[0];
        for (let i = 0;i < visitors.length; i++) {
          if (skipping[i] === null) {
            var _leaveList$i;
            const result = (_leaveList$i = leaveList[i]) === null || _leaveList$i === undefined ? undefined : _leaveList$i.apply(visitors[i], args);
            if (result === BREAK) {
              skipping[i] = BREAK;
            } else if (result !== undefined && result !== false) {
              return result;
            }
          } else if (skipping[i] === node) {
            skipping[i] = null;
          }
        }
      }
    };
    mergedVisitor[kind] = mergedEnterLeave;
  }
  return mergedVisitor;
}
function getEnterLeaveForKind(visitor, kind) {
  const kindVisitor = visitor[kind];
  if (typeof kindVisitor === "object") {
    return kindVisitor;
  } else if (typeof kindVisitor === "function") {
    return {
      enter: kindVisitor,
      leave: undefined
    };
  }
  return {
    enter: visitor.enter,
    leave: visitor.leave
  };
}

// node_modules/graphql/language/printer.mjs
function print(ast) {
  return visit(ast, printDocASTReducer);
}
var MAX_LINE_LENGTH = 80;
var printDocASTReducer = {
  Name: {
    leave: (node) => node.value
  },
  Variable: {
    leave: (node) => "$" + node.name
  },
  Document: {
    leave: (node) => join(node.definitions, `

`)
  },
  OperationDefinition: {
    leave(node) {
      const varDefs = wrap("(", join(node.variableDefinitions, ", "), ")");
      const prefix = join([
        node.operation,
        join([node.name, varDefs]),
        join(node.directives, " ")
      ], " ");
      return (prefix === "query" ? "" : prefix + " ") + node.selectionSet;
    }
  },
  VariableDefinition: {
    leave: ({ variable, type, defaultValue, directives }) => variable + ": " + type + wrap(" = ", defaultValue) + wrap(" ", join(directives, " "))
  },
  SelectionSet: {
    leave: ({ selections }) => block(selections)
  },
  Field: {
    leave({ alias, name, arguments: args, directives, selectionSet }) {
      const prefix = wrap("", alias, ": ") + name;
      let argsLine = prefix + wrap("(", join(args, ", "), ")");
      if (argsLine.length > MAX_LINE_LENGTH) {
        argsLine = prefix + wrap(`(
`, indent(join(args, `
`)), `
)`);
      }
      return join([argsLine, join(directives, " "), selectionSet], " ");
    }
  },
  Argument: {
    leave: ({ name, value }) => name + ": " + value
  },
  FragmentSpread: {
    leave: ({ name, directives }) => "..." + name + wrap(" ", join(directives, " "))
  },
  InlineFragment: {
    leave: ({ typeCondition, directives, selectionSet }) => join([
      "...",
      wrap("on ", typeCondition),
      join(directives, " "),
      selectionSet
    ], " ")
  },
  FragmentDefinition: {
    leave: ({ name, typeCondition, variableDefinitions, directives, selectionSet }) => `fragment ${name}${wrap("(", join(variableDefinitions, ", "), ")")} ` + `on ${typeCondition} ${wrap("", join(directives, " "), " ")}` + selectionSet
  },
  IntValue: {
    leave: ({ value }) => value
  },
  FloatValue: {
    leave: ({ value }) => value
  },
  StringValue: {
    leave: ({ value, block: isBlockString }) => isBlockString ? printBlockString(value) : printString(value)
  },
  BooleanValue: {
    leave: ({ value }) => value ? "true" : "false"
  },
  NullValue: {
    leave: () => "null"
  },
  EnumValue: {
    leave: ({ value }) => value
  },
  ListValue: {
    leave: ({ values }) => "[" + join(values, ", ") + "]"
  },
  ObjectValue: {
    leave: ({ fields }) => "{" + join(fields, ", ") + "}"
  },
  ObjectField: {
    leave: ({ name, value }) => name + ": " + value
  },
  Directive: {
    leave: ({ name, arguments: args }) => "@" + name + wrap("(", join(args, ", "), ")")
  },
  NamedType: {
    leave: ({ name }) => name
  },
  ListType: {
    leave: ({ type }) => "[" + type + "]"
  },
  NonNullType: {
    leave: ({ type }) => type + "!"
  },
  SchemaDefinition: {
    leave: ({ description, directives, operationTypes }) => wrap("", description, `
`) + join(["schema", join(directives, " "), block(operationTypes)], " ")
  },
  OperationTypeDefinition: {
    leave: ({ operation, type }) => operation + ": " + type
  },
  ScalarTypeDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, `
`) + join(["scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, `
`) + join([
      "type",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  FieldDefinition: {
    leave: ({ description, name, arguments: args, type, directives }) => wrap("", description, `
`) + name + (hasMultilineItems(args) ? wrap(`(
`, indent(join(args, `
`)), `
)`) : wrap("(", join(args, ", "), ")")) + ": " + type + wrap(" ", join(directives, " "))
  },
  InputValueDefinition: {
    leave: ({ description, name, type, defaultValue, directives }) => wrap("", description, `
`) + join([name + ": " + type, wrap("= ", defaultValue), join(directives, " ")], " ")
  },
  InterfaceTypeDefinition: {
    leave: ({ description, name, interfaces, directives, fields }) => wrap("", description, `
`) + join([
      "interface",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  UnionTypeDefinition: {
    leave: ({ description, name, directives, types }) => wrap("", description, `
`) + join(["union", name, join(directives, " "), wrap("= ", join(types, " | "))], " ")
  },
  EnumTypeDefinition: {
    leave: ({ description, name, directives, values }) => wrap("", description, `
`) + join(["enum", name, join(directives, " "), block(values)], " ")
  },
  EnumValueDefinition: {
    leave: ({ description, name, directives }) => wrap("", description, `
`) + join([name, join(directives, " ")], " ")
  },
  InputObjectTypeDefinition: {
    leave: ({ description, name, directives, fields }) => wrap("", description, `
`) + join(["input", name, join(directives, " "), block(fields)], " ")
  },
  DirectiveDefinition: {
    leave: ({ description, name, arguments: args, repeatable, locations }) => wrap("", description, `
`) + "directive @" + name + (hasMultilineItems(args) ? wrap(`(
`, indent(join(args, `
`)), `
)`) : wrap("(", join(args, ", "), ")")) + (repeatable ? " repeatable" : "") + " on " + join(locations, " | ")
  },
  SchemaExtension: {
    leave: ({ directives, operationTypes }) => join(["extend schema", join(directives, " "), block(operationTypes)], " ")
  },
  ScalarTypeExtension: {
    leave: ({ name, directives }) => join(["extend scalar", name, join(directives, " ")], " ")
  },
  ObjectTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join([
      "extend type",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  InterfaceTypeExtension: {
    leave: ({ name, interfaces, directives, fields }) => join([
      "extend interface",
      name,
      wrap("implements ", join(interfaces, " & ")),
      join(directives, " "),
      block(fields)
    ], " ")
  },
  UnionTypeExtension: {
    leave: ({ name, directives, types }) => join([
      "extend union",
      name,
      join(directives, " "),
      wrap("= ", join(types, " | "))
    ], " ")
  },
  EnumTypeExtension: {
    leave: ({ name, directives, values }) => join(["extend enum", name, join(directives, " "), block(values)], " ")
  },
  InputObjectTypeExtension: {
    leave: ({ name, directives, fields }) => join(["extend input", name, join(directives, " "), block(fields)], " ")
  }
};
function join(maybeArray, separator = "") {
  var _maybeArray$filter$jo;
  return (_maybeArray$filter$jo = maybeArray === null || maybeArray === undefined ? undefined : maybeArray.filter((x) => x).join(separator)) !== null && _maybeArray$filter$jo !== undefined ? _maybeArray$filter$jo : "";
}
function block(array) {
  return wrap(`{
`, indent(join(array, `
`)), `
}`);
}
function wrap(start, maybeString, end = "") {
  return maybeString != null && maybeString !== "" ? start + maybeString + end : "";
}
function indent(str) {
  return wrap("  ", str.replace(/\n/g, `
  `));
}
function hasMultilineItems(maybeArray) {
  var _maybeArray$some;
  return (_maybeArray$some = maybeArray === null || maybeArray === undefined ? undefined : maybeArray.some((str) => str.includes(`
`))) !== null && _maybeArray$some !== undefined ? _maybeArray$some : false;
}

// node_modules/graphql/utilities/valueFromASTUntyped.mjs
function valueFromASTUntyped(valueNode, variables) {
  switch (valueNode.kind) {
    case Kind.NULL:
      return null;
    case Kind.INT:
      return parseInt(valueNode.value, 10);
    case Kind.FLOAT:
      return parseFloat(valueNode.value);
    case Kind.STRING:
    case Kind.ENUM:
    case Kind.BOOLEAN:
      return valueNode.value;
    case Kind.LIST:
      return valueNode.values.map((node) => valueFromASTUntyped(node, variables));
    case Kind.OBJECT:
      return keyValMap(valueNode.fields, (field) => field.name.value, (field) => valueFromASTUntyped(field.value, variables));
    case Kind.VARIABLE:
      return variables === null || variables === undefined ? undefined : variables[valueNode.name.value];
  }
}

// node_modules/graphql/type/assertName.mjs
function assertName(name) {
  name != null || devAssert(false, "Must provide name.");
  typeof name === "string" || devAssert(false, "Expected name to be a string.");
  if (name.length === 0) {
    throw new GraphQLError("Expected name to be a non-empty string.");
  }
  for (let i = 1;i < name.length; ++i) {
    if (!isNameContinue(name.charCodeAt(i))) {
      throw new GraphQLError(`Names must only contain [_a-zA-Z0-9] but "${name}" does not.`);
    }
  }
  if (!isNameStart(name.charCodeAt(0))) {
    throw new GraphQLError(`Names must start with [_a-zA-Z] but "${name}" does not.`);
  }
  return name;
}
function assertEnumValueName(name) {
  if (name === "true" || name === "false" || name === "null") {
    throw new GraphQLError(`Enum values cannot be named: ${name}`);
  }
  return assertName(name);
}

// node_modules/graphql/type/definition.mjs
function isType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type) || isListType(type) || isNonNullType(type);
}
function isScalarType(type) {
  return instanceOf(type, GraphQLScalarType);
}
function isObjectType(type) {
  return instanceOf(type, GraphQLObjectType);
}
function isInterfaceType(type) {
  return instanceOf(type, GraphQLInterfaceType);
}
function isUnionType(type) {
  return instanceOf(type, GraphQLUnionType);
}
function isEnumType(type) {
  return instanceOf(type, GraphQLEnumType);
}
function isInputObjectType(type) {
  return instanceOf(type, GraphQLInputObjectType);
}
function isListType(type) {
  return instanceOf(type, GraphQLList);
}
function isNonNullType(type) {
  return instanceOf(type, GraphQLNonNull);
}
function isInputType(type) {
  return isScalarType(type) || isEnumType(type) || isInputObjectType(type) || isWrappingType(type) && isInputType(type.ofType);
}
function isOutputType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isWrappingType(type) && isOutputType(type.ofType);
}
function isLeafType(type) {
  return isScalarType(type) || isEnumType(type);
}
function isCompositeType(type) {
  return isObjectType(type) || isInterfaceType(type) || isUnionType(type);
}
function isAbstractType(type) {
  return isInterfaceType(type) || isUnionType(type);
}
class GraphQLList {
  constructor(ofType) {
    isType(ofType) || devAssert(false, `Expected ${inspect(ofType)} to be a GraphQL type.`);
    this.ofType = ofType;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLList";
  }
  toString() {
    return "[" + String(this.ofType) + "]";
  }
  toJSON() {
    return this.toString();
  }
}

class GraphQLNonNull {
  constructor(ofType) {
    isNullableType(ofType) || devAssert(false, `Expected ${inspect(ofType)} to be a GraphQL nullable type.`);
    this.ofType = ofType;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLNonNull";
  }
  toString() {
    return String(this.ofType) + "!";
  }
  toJSON() {
    return this.toString();
  }
}
function isWrappingType(type) {
  return isListType(type) || isNonNullType(type);
}
function isNullableType(type) {
  return isType(type) && !isNonNullType(type);
}
function getNullableType(type) {
  if (type) {
    return isNonNullType(type) ? type.ofType : type;
  }
}
function isNamedType(type) {
  return isScalarType(type) || isObjectType(type) || isInterfaceType(type) || isUnionType(type) || isEnumType(type) || isInputObjectType(type);
}
function getNamedType(type) {
  if (type) {
    let unwrappedType = type;
    while (isWrappingType(unwrappedType)) {
      unwrappedType = unwrappedType.ofType;
    }
    return unwrappedType;
  }
}
function resolveReadonlyArrayThunk(thunk) {
  return typeof thunk === "function" ? thunk() : thunk;
}
function resolveObjMapThunk(thunk) {
  return typeof thunk === "function" ? thunk() : thunk;
}

class GraphQLScalarType {
  constructor(config) {
    var _config$parseValue, _config$serialize, _config$parseLiteral, _config$extensionASTN;
    const parseValue = (_config$parseValue = config.parseValue) !== null && _config$parseValue !== undefined ? _config$parseValue : identityFunc;
    this.name = assertName(config.name);
    this.description = config.description;
    this.specifiedByURL = config.specifiedByURL;
    this.serialize = (_config$serialize = config.serialize) !== null && _config$serialize !== undefined ? _config$serialize : identityFunc;
    this.parseValue = parseValue;
    this.parseLiteral = (_config$parseLiteral = config.parseLiteral) !== null && _config$parseLiteral !== undefined ? _config$parseLiteral : (node, variables) => parseValue(valueFromASTUntyped(node, variables));
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN = config.extensionASTNodes) !== null && _config$extensionASTN !== undefined ? _config$extensionASTN : [];
    config.specifiedByURL == null || typeof config.specifiedByURL === "string" || devAssert(false, `${this.name} must provide "specifiedByURL" as a string, ` + `but got: ${inspect(config.specifiedByURL)}.`);
    config.serialize == null || typeof config.serialize === "function" || devAssert(false, `${this.name} must provide "serialize" function. If this custom Scalar is also used as an input type, ensure "parseValue" and "parseLiteral" functions are also provided.`);
    if (config.parseLiteral) {
      typeof config.parseValue === "function" && typeof config.parseLiteral === "function" || devAssert(false, `${this.name} must provide both "parseValue" and "parseLiteral" functions.`);
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLScalarType";
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      specifiedByURL: this.specifiedByURL,
      serialize: this.serialize,
      parseValue: this.parseValue,
      parseLiteral: this.parseLiteral,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}

class GraphQLObjectType {
  constructor(config) {
    var _config$extensionASTN2;
    this.name = assertName(config.name);
    this.description = config.description;
    this.isTypeOf = config.isTypeOf;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN2 = config.extensionASTNodes) !== null && _config$extensionASTN2 !== undefined ? _config$extensionASTN2 : [];
    this._fields = () => defineFieldMap(config);
    this._interfaces = () => defineInterfaces(config);
    config.isTypeOf == null || typeof config.isTypeOf === "function" || devAssert(false, `${this.name} must provide "isTypeOf" as a function, ` + `but got: ${inspect(config.isTypeOf)}.`);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLObjectType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: fieldsToFieldsConfig(this.getFields()),
      isTypeOf: this.isTypeOf,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}
function defineInterfaces(config) {
  var _config$interfaces;
  const interfaces = resolveReadonlyArrayThunk((_config$interfaces = config.interfaces) !== null && _config$interfaces !== undefined ? _config$interfaces : []);
  Array.isArray(interfaces) || devAssert(false, `${config.name} interfaces must be an Array or a function which returns an Array.`);
  return interfaces;
}
function defineFieldMap(config) {
  const fieldMap = resolveObjMapThunk(config.fields);
  isPlainObj(fieldMap) || devAssert(false, `${config.name} fields must be an object with field names as keys or a function which returns such an object.`);
  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    var _fieldConfig$args;
    isPlainObj(fieldConfig) || devAssert(false, `${config.name}.${fieldName} field config must be an object.`);
    fieldConfig.resolve == null || typeof fieldConfig.resolve === "function" || devAssert(false, `${config.name}.${fieldName} field resolver must be a function if ` + `provided, but got: ${inspect(fieldConfig.resolve)}.`);
    const argsConfig = (_fieldConfig$args = fieldConfig.args) !== null && _fieldConfig$args !== undefined ? _fieldConfig$args : {};
    isPlainObj(argsConfig) || devAssert(false, `${config.name}.${fieldName} args must be an object with argument names as keys.`);
    return {
      name: assertName(fieldName),
      description: fieldConfig.description,
      type: fieldConfig.type,
      args: defineArguments(argsConfig),
      resolve: fieldConfig.resolve,
      subscribe: fieldConfig.subscribe,
      deprecationReason: fieldConfig.deprecationReason,
      extensions: toObjMap(fieldConfig.extensions),
      astNode: fieldConfig.astNode
    };
  });
}
function defineArguments(config) {
  return Object.entries(config).map(([argName, argConfig]) => ({
    name: assertName(argName),
    description: argConfig.description,
    type: argConfig.type,
    defaultValue: argConfig.defaultValue,
    deprecationReason: argConfig.deprecationReason,
    extensions: toObjMap(argConfig.extensions),
    astNode: argConfig.astNode
  }));
}
function isPlainObj(obj) {
  return isObjectLike(obj) && !Array.isArray(obj);
}
function fieldsToFieldsConfig(fields) {
  return mapValue(fields, (field) => ({
    description: field.description,
    type: field.type,
    args: argsToArgsConfig(field.args),
    resolve: field.resolve,
    subscribe: field.subscribe,
    deprecationReason: field.deprecationReason,
    extensions: field.extensions,
    astNode: field.astNode
  }));
}
function argsToArgsConfig(args) {
  return keyValMap(args, (arg) => arg.name, (arg) => ({
    description: arg.description,
    type: arg.type,
    defaultValue: arg.defaultValue,
    deprecationReason: arg.deprecationReason,
    extensions: arg.extensions,
    astNode: arg.astNode
  }));
}
function isRequiredArgument(arg) {
  return isNonNullType(arg.type) && arg.defaultValue === undefined;
}

class GraphQLInterfaceType {
  constructor(config) {
    var _config$extensionASTN3;
    this.name = assertName(config.name);
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN3 = config.extensionASTNodes) !== null && _config$extensionASTN3 !== undefined ? _config$extensionASTN3 : [];
    this._fields = defineFieldMap.bind(undefined, config);
    this._interfaces = defineInterfaces.bind(undefined, config);
    config.resolveType == null || typeof config.resolveType === "function" || devAssert(false, `${this.name} must provide "resolveType" as a function, ` + `but got: ${inspect(config.resolveType)}.`);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLInterfaceType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  getInterfaces() {
    if (typeof this._interfaces === "function") {
      this._interfaces = this._interfaces();
    }
    return this._interfaces;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      interfaces: this.getInterfaces(),
      fields: fieldsToFieldsConfig(this.getFields()),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}

class GraphQLUnionType {
  constructor(config) {
    var _config$extensionASTN4;
    this.name = assertName(config.name);
    this.description = config.description;
    this.resolveType = config.resolveType;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN4 = config.extensionASTNodes) !== null && _config$extensionASTN4 !== undefined ? _config$extensionASTN4 : [];
    this._types = defineTypes.bind(undefined, config);
    config.resolveType == null || typeof config.resolveType === "function" || devAssert(false, `${this.name} must provide "resolveType" as a function, ` + `but got: ${inspect(config.resolveType)}.`);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLUnionType";
  }
  getTypes() {
    if (typeof this._types === "function") {
      this._types = this._types();
    }
    return this._types;
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      types: this.getTypes(),
      resolveType: this.resolveType,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}
function defineTypes(config) {
  const types = resolveReadonlyArrayThunk(config.types);
  Array.isArray(types) || devAssert(false, `Must provide Array of types or a function which returns such an array for Union ${config.name}.`);
  return types;
}

class GraphQLEnumType {
  constructor(config) {
    var _config$extensionASTN5;
    this.name = assertName(config.name);
    this.description = config.description;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN5 = config.extensionASTNodes) !== null && _config$extensionASTN5 !== undefined ? _config$extensionASTN5 : [];
    this._values = typeof config.values === "function" ? config.values : defineEnumValues(this.name, config.values);
    this._valueLookup = null;
    this._nameLookup = null;
  }
  get [Symbol.toStringTag]() {
    return "GraphQLEnumType";
  }
  getValues() {
    if (typeof this._values === "function") {
      this._values = defineEnumValues(this.name, this._values());
    }
    return this._values;
  }
  getValue(name) {
    if (this._nameLookup === null) {
      this._nameLookup = keyMap(this.getValues(), (value) => value.name);
    }
    return this._nameLookup[name];
  }
  serialize(outputValue) {
    if (this._valueLookup === null) {
      this._valueLookup = new Map(this.getValues().map((enumValue) => [enumValue.value, enumValue]));
    }
    const enumValue = this._valueLookup.get(outputValue);
    if (enumValue === undefined) {
      throw new GraphQLError(`Enum "${this.name}" cannot represent value: ${inspect(outputValue)}`);
    }
    return enumValue.name;
  }
  parseValue(inputValue) {
    if (typeof inputValue !== "string") {
      const valueStr = inspect(inputValue);
      throw new GraphQLError(`Enum "${this.name}" cannot represent non-string value: ${valueStr}.` + didYouMeanEnumValue(this, valueStr));
    }
    const enumValue = this.getValue(inputValue);
    if (enumValue == null) {
      throw new GraphQLError(`Value "${inputValue}" does not exist in "${this.name}" enum.` + didYouMeanEnumValue(this, inputValue));
    }
    return enumValue.value;
  }
  parseLiteral(valueNode, _variables) {
    if (valueNode.kind !== Kind.ENUM) {
      const valueStr = print(valueNode);
      throw new GraphQLError(`Enum "${this.name}" cannot represent non-enum value: ${valueStr}.` + didYouMeanEnumValue(this, valueStr), {
        nodes: valueNode
      });
    }
    const enumValue = this.getValue(valueNode.value);
    if (enumValue == null) {
      const valueStr = print(valueNode);
      throw new GraphQLError(`Value "${valueStr}" does not exist in "${this.name}" enum.` + didYouMeanEnumValue(this, valueStr), {
        nodes: valueNode
      });
    }
    return enumValue.value;
  }
  toConfig() {
    const values = keyValMap(this.getValues(), (value) => value.name, (value) => ({
      description: value.description,
      value: value.value,
      deprecationReason: value.deprecationReason,
      extensions: value.extensions,
      astNode: value.astNode
    }));
    return {
      name: this.name,
      description: this.description,
      values,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}
function didYouMeanEnumValue(enumType, unknownValueStr) {
  const allNames = enumType.getValues().map((value) => value.name);
  const suggestedValues = suggestionList(unknownValueStr, allNames);
  return didYouMean("the enum value", suggestedValues);
}
function defineEnumValues(typeName, valueMap) {
  isPlainObj(valueMap) || devAssert(false, `${typeName} values must be an object with value names as keys.`);
  return Object.entries(valueMap).map(([valueName, valueConfig]) => {
    isPlainObj(valueConfig) || devAssert(false, `${typeName}.${valueName} must refer to an object with a "value" key ` + `representing an internal value but got: ${inspect(valueConfig)}.`);
    return {
      name: assertEnumValueName(valueName),
      description: valueConfig.description,
      value: valueConfig.value !== undefined ? valueConfig.value : valueName,
      deprecationReason: valueConfig.deprecationReason,
      extensions: toObjMap(valueConfig.extensions),
      astNode: valueConfig.astNode
    };
  });
}

class GraphQLInputObjectType {
  constructor(config) {
    var _config$extensionASTN6, _config$isOneOf;
    this.name = assertName(config.name);
    this.description = config.description;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN6 = config.extensionASTNodes) !== null && _config$extensionASTN6 !== undefined ? _config$extensionASTN6 : [];
    this.isOneOf = (_config$isOneOf = config.isOneOf) !== null && _config$isOneOf !== undefined ? _config$isOneOf : false;
    this._fields = defineInputFieldMap.bind(undefined, config);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLInputObjectType";
  }
  getFields() {
    if (typeof this._fields === "function") {
      this._fields = this._fields();
    }
    return this._fields;
  }
  toConfig() {
    const fields = mapValue(this.getFields(), (field) => ({
      description: field.description,
      type: field.type,
      defaultValue: field.defaultValue,
      deprecationReason: field.deprecationReason,
      extensions: field.extensions,
      astNode: field.astNode
    }));
    return {
      name: this.name,
      description: this.description,
      fields,
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes,
      isOneOf: this.isOneOf
    };
  }
  toString() {
    return this.name;
  }
  toJSON() {
    return this.toString();
  }
}
function defineInputFieldMap(config) {
  const fieldMap = resolveObjMapThunk(config.fields);
  isPlainObj(fieldMap) || devAssert(false, `${config.name} fields must be an object with field names as keys or a function which returns such an object.`);
  return mapValue(fieldMap, (fieldConfig, fieldName) => {
    !("resolve" in fieldConfig) || devAssert(false, `${config.name}.${fieldName} field has a resolve property, but Input Types cannot define resolvers.`);
    return {
      name: assertName(fieldName),
      description: fieldConfig.description,
      type: fieldConfig.type,
      defaultValue: fieldConfig.defaultValue,
      deprecationReason: fieldConfig.deprecationReason,
      extensions: toObjMap(fieldConfig.extensions),
      astNode: fieldConfig.astNode
    };
  });
}
function isRequiredInputField(field) {
  return isNonNullType(field.type) && field.defaultValue === undefined;
}

// node_modules/graphql/language/directiveLocation.mjs
var DirectiveLocation;
(function(DirectiveLocation) {
  DirectiveLocation["QUERY"] = "QUERY";
  DirectiveLocation["MUTATION"] = "MUTATION";
  DirectiveLocation["SUBSCRIPTION"] = "SUBSCRIPTION";
  DirectiveLocation["FIELD"] = "FIELD";
  DirectiveLocation["FRAGMENT_DEFINITION"] = "FRAGMENT_DEFINITION";
  DirectiveLocation["FRAGMENT_SPREAD"] = "FRAGMENT_SPREAD";
  DirectiveLocation["INLINE_FRAGMENT"] = "INLINE_FRAGMENT";
  DirectiveLocation["VARIABLE_DEFINITION"] = "VARIABLE_DEFINITION";
  DirectiveLocation["SCHEMA"] = "SCHEMA";
  DirectiveLocation["SCALAR"] = "SCALAR";
  DirectiveLocation["OBJECT"] = "OBJECT";
  DirectiveLocation["FIELD_DEFINITION"] = "FIELD_DEFINITION";
  DirectiveLocation["ARGUMENT_DEFINITION"] = "ARGUMENT_DEFINITION";
  DirectiveLocation["INTERFACE"] = "INTERFACE";
  DirectiveLocation["UNION"] = "UNION";
  DirectiveLocation["ENUM"] = "ENUM";
  DirectiveLocation["ENUM_VALUE"] = "ENUM_VALUE";
  DirectiveLocation["INPUT_OBJECT"] = "INPUT_OBJECT";
  DirectiveLocation["INPUT_FIELD_DEFINITION"] = "INPUT_FIELD_DEFINITION";
})(DirectiveLocation || (DirectiveLocation = {}));

// node_modules/graphql/type/scalars.mjs
var GRAPHQL_MAX_INT = 2147483647;
var GRAPHQL_MIN_INT = -2147483648;
var GraphQLInt = new GraphQLScalarType({
  name: "Int",
  description: "The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.",
  serialize(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === "boolean") {
      return coercedValue ? 1 : 0;
    }
    let num = coercedValue;
    if (typeof coercedValue === "string" && coercedValue !== "") {
      num = Number(coercedValue);
    }
    if (typeof num !== "number" || !Number.isInteger(num)) {
      throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(coercedValue)}`);
    }
    if (num > GRAPHQL_MAX_INT || num < GRAPHQL_MIN_INT) {
      throw new GraphQLError("Int cannot represent non 32-bit signed integer value: " + inspect(coercedValue));
    }
    return num;
  },
  parseValue(inputValue) {
    if (typeof inputValue !== "number" || !Number.isInteger(inputValue)) {
      throw new GraphQLError(`Int cannot represent non-integer value: ${inspect(inputValue)}`);
    }
    if (inputValue > GRAPHQL_MAX_INT || inputValue < GRAPHQL_MIN_INT) {
      throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${inputValue}`);
    }
    return inputValue;
  },
  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.INT) {
      throw new GraphQLError(`Int cannot represent non-integer value: ${print(valueNode)}`, {
        nodes: valueNode
      });
    }
    const num = parseInt(valueNode.value, 10);
    if (num > GRAPHQL_MAX_INT || num < GRAPHQL_MIN_INT) {
      throw new GraphQLError(`Int cannot represent non 32-bit signed integer value: ${valueNode.value}`, {
        nodes: valueNode
      });
    }
    return num;
  }
});
var GraphQLFloat = new GraphQLScalarType({
  name: "Float",
  description: "The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).",
  serialize(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === "boolean") {
      return coercedValue ? 1 : 0;
    }
    let num = coercedValue;
    if (typeof coercedValue === "string" && coercedValue !== "") {
      num = Number(coercedValue);
    }
    if (typeof num !== "number" || !Number.isFinite(num)) {
      throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(coercedValue)}`);
    }
    return num;
  },
  parseValue(inputValue) {
    if (typeof inputValue !== "number" || !Number.isFinite(inputValue)) {
      throw new GraphQLError(`Float cannot represent non numeric value: ${inspect(inputValue)}`);
    }
    return inputValue;
  },
  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.FLOAT && valueNode.kind !== Kind.INT) {
      throw new GraphQLError(`Float cannot represent non numeric value: ${print(valueNode)}`, valueNode);
    }
    return parseFloat(valueNode.value);
  }
});
var GraphQLString = new GraphQLScalarType({
  name: "String",
  description: "The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.",
  serialize(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === "string") {
      return coercedValue;
    }
    if (typeof coercedValue === "boolean") {
      return coercedValue ? "true" : "false";
    }
    if (typeof coercedValue === "number" && Number.isFinite(coercedValue)) {
      return coercedValue.toString();
    }
    throw new GraphQLError(`String cannot represent value: ${inspect(outputValue)}`);
  },
  parseValue(inputValue) {
    if (typeof inputValue !== "string") {
      throw new GraphQLError(`String cannot represent a non string value: ${inspect(inputValue)}`);
    }
    return inputValue;
  },
  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.STRING) {
      throw new GraphQLError(`String cannot represent a non string value: ${print(valueNode)}`, {
        nodes: valueNode
      });
    }
    return valueNode.value;
  }
});
var GraphQLBoolean = new GraphQLScalarType({
  name: "Boolean",
  description: "The `Boolean` scalar type represents `true` or `false`.",
  serialize(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === "boolean") {
      return coercedValue;
    }
    if (Number.isFinite(coercedValue)) {
      return coercedValue !== 0;
    }
    throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(coercedValue)}`);
  },
  parseValue(inputValue) {
    if (typeof inputValue !== "boolean") {
      throw new GraphQLError(`Boolean cannot represent a non boolean value: ${inspect(inputValue)}`);
    }
    return inputValue;
  },
  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.BOOLEAN) {
      throw new GraphQLError(`Boolean cannot represent a non boolean value: ${print(valueNode)}`, {
        nodes: valueNode
      });
    }
    return valueNode.value;
  }
});
var GraphQLID = new GraphQLScalarType({
  name: "ID",
  description: 'The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.',
  serialize(outputValue) {
    const coercedValue = serializeObject(outputValue);
    if (typeof coercedValue === "string") {
      return coercedValue;
    }
    if (Number.isInteger(coercedValue)) {
      return String(coercedValue);
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(outputValue)}`);
  },
  parseValue(inputValue) {
    if (typeof inputValue === "string") {
      return inputValue;
    }
    if (typeof inputValue === "number" && Number.isInteger(inputValue)) {
      return inputValue.toString();
    }
    throw new GraphQLError(`ID cannot represent value: ${inspect(inputValue)}`);
  },
  parseLiteral(valueNode) {
    if (valueNode.kind !== Kind.STRING && valueNode.kind !== Kind.INT) {
      throw new GraphQLError("ID cannot represent a non-string and non-integer value: " + print(valueNode), {
        nodes: valueNode
      });
    }
    return valueNode.value;
  }
});
var specifiedScalarTypes = Object.freeze([
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID
]);
function isSpecifiedScalarType(type) {
  return specifiedScalarTypes.some(({ name }) => type.name === name);
}
function serializeObject(outputValue) {
  if (isObjectLike(outputValue)) {
    if (typeof outputValue.valueOf === "function") {
      const valueOfResult = outputValue.valueOf();
      if (!isObjectLike(valueOfResult)) {
        return valueOfResult;
      }
    }
    if (typeof outputValue.toJSON === "function") {
      return outputValue.toJSON();
    }
  }
  return outputValue;
}

// node_modules/graphql/type/directives.mjs
function isDirective(directive) {
  return instanceOf(directive, GraphQLDirective);
}
class GraphQLDirective {
  constructor(config) {
    var _config$isRepeatable, _config$args;
    this.name = assertName(config.name);
    this.description = config.description;
    this.locations = config.locations;
    this.isRepeatable = (_config$isRepeatable = config.isRepeatable) !== null && _config$isRepeatable !== undefined ? _config$isRepeatable : false;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    Array.isArray(config.locations) || devAssert(false, `@${config.name} locations must be an Array.`);
    const args = (_config$args = config.args) !== null && _config$args !== undefined ? _config$args : {};
    isObjectLike(args) && !Array.isArray(args) || devAssert(false, `@${config.name} args must be an object with argument names as keys.`);
    this.args = defineArguments(args);
  }
  get [Symbol.toStringTag]() {
    return "GraphQLDirective";
  }
  toConfig() {
    return {
      name: this.name,
      description: this.description,
      locations: this.locations,
      args: argsToArgsConfig(this.args),
      isRepeatable: this.isRepeatable,
      extensions: this.extensions,
      astNode: this.astNode
    };
  }
  toString() {
    return "@" + this.name;
  }
  toJSON() {
    return this.toString();
  }
}
var GraphQLIncludeDirective = new GraphQLDirective({
  name: "include",
  description: "Directs the executor to include this field or fragment only when the `if` argument is true.",
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Included when true."
    }
  }
});
var GraphQLSkipDirective = new GraphQLDirective({
  name: "skip",
  description: "Directs the executor to skip this field or fragment when the `if` argument is true.",
  locations: [
    DirectiveLocation.FIELD,
    DirectiveLocation.FRAGMENT_SPREAD,
    DirectiveLocation.INLINE_FRAGMENT
  ],
  args: {
    if: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: "Skipped when true."
    }
  }
});
var DEFAULT_DEPRECATION_REASON = "No longer supported";
var GraphQLDeprecatedDirective = new GraphQLDirective({
  name: "deprecated",
  description: "Marks an element of a GraphQL schema as no longer supported.",
  locations: [
    DirectiveLocation.FIELD_DEFINITION,
    DirectiveLocation.ARGUMENT_DEFINITION,
    DirectiveLocation.INPUT_FIELD_DEFINITION,
    DirectiveLocation.ENUM_VALUE
  ],
  args: {
    reason: {
      type: GraphQLString,
      description: "Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).",
      defaultValue: DEFAULT_DEPRECATION_REASON
    }
  }
});
var GraphQLSpecifiedByDirective = new GraphQLDirective({
  name: "specifiedBy",
  description: "Exposes a URL that specifies the behavior of this scalar.",
  locations: [DirectiveLocation.SCALAR],
  args: {
    url: {
      type: new GraphQLNonNull(GraphQLString),
      description: "The URL that specifies the behavior of this scalar."
    }
  }
});
var GraphQLOneOfDirective = new GraphQLDirective({
  name: "oneOf",
  description: "Indicates exactly one field must be supplied and this field must not be `null`.",
  locations: [DirectiveLocation.INPUT_OBJECT],
  args: {}
});
var specifiedDirectives = Object.freeze([
  GraphQLIncludeDirective,
  GraphQLSkipDirective,
  GraphQLDeprecatedDirective,
  GraphQLSpecifiedByDirective,
  GraphQLOneOfDirective
]);

// node_modules/graphql/jsutils/isIterableObject.mjs
function isIterableObject(maybeIterable) {
  return typeof maybeIterable === "object" && typeof (maybeIterable === null || maybeIterable === undefined ? undefined : maybeIterable[Symbol.iterator]) === "function";
}

// node_modules/graphql/utilities/astFromValue.mjs
function astFromValue(value, type) {
  if (isNonNullType(type)) {
    const astValue = astFromValue(value, type.ofType);
    if ((astValue === null || astValue === undefined ? undefined : astValue.kind) === Kind.NULL) {
      return null;
    }
    return astValue;
  }
  if (value === null) {
    return {
      kind: Kind.NULL
    };
  }
  if (value === undefined) {
    return null;
  }
  if (isListType(type)) {
    const itemType = type.ofType;
    if (isIterableObject(value)) {
      const valuesNodes = [];
      for (const item of value) {
        const itemNode = astFromValue(item, itemType);
        if (itemNode != null) {
          valuesNodes.push(itemNode);
        }
      }
      return {
        kind: Kind.LIST,
        values: valuesNodes
      };
    }
    return astFromValue(value, itemType);
  }
  if (isInputObjectType(type)) {
    if (!isObjectLike(value)) {
      return null;
    }
    const fieldNodes = [];
    for (const field of Object.values(type.getFields())) {
      const fieldValue = astFromValue(value[field.name], field.type);
      if (fieldValue) {
        fieldNodes.push({
          kind: Kind.OBJECT_FIELD,
          name: {
            kind: Kind.NAME,
            value: field.name
          },
          value: fieldValue
        });
      }
    }
    return {
      kind: Kind.OBJECT,
      fields: fieldNodes
    };
  }
  if (isLeafType(type)) {
    const serialized = type.serialize(value);
    if (serialized == null) {
      return null;
    }
    if (typeof serialized === "boolean") {
      return {
        kind: Kind.BOOLEAN,
        value: serialized
      };
    }
    if (typeof serialized === "number" && Number.isFinite(serialized)) {
      const stringNum = String(serialized);
      return integerStringRegExp.test(stringNum) ? {
        kind: Kind.INT,
        value: stringNum
      } : {
        kind: Kind.FLOAT,
        value: stringNum
      };
    }
    if (typeof serialized === "string") {
      if (isEnumType(type)) {
        return {
          kind: Kind.ENUM,
          value: serialized
        };
      }
      if (type === GraphQLID && integerStringRegExp.test(serialized)) {
        return {
          kind: Kind.INT,
          value: serialized
        };
      }
      return {
        kind: Kind.STRING,
        value: serialized
      };
    }
    throw new TypeError(`Cannot convert value to AST: ${inspect(serialized)}.`);
  }
  invariant(false, "Unexpected input type: " + inspect(type));
}
var integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;

// node_modules/graphql/type/introspection.mjs
var __Schema = new GraphQLObjectType({
  name: "__Schema",
  description: "A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.",
  fields: () => ({
    description: {
      type: GraphQLString,
      resolve: (schema) => schema.description
    },
    types: {
      description: "A list of all types supported by this server.",
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Type))),
      resolve(schema) {
        return Object.values(schema.getTypeMap());
      }
    },
    queryType: {
      description: "The type that query operations will be rooted at.",
      type: new GraphQLNonNull(__Type),
      resolve: (schema) => schema.getQueryType()
    },
    mutationType: {
      description: "If this server supports mutation, the type that mutation operations will be rooted at.",
      type: __Type,
      resolve: (schema) => schema.getMutationType()
    },
    subscriptionType: {
      description: "If this server support subscription, the type that subscription operations will be rooted at.",
      type: __Type,
      resolve: (schema) => schema.getSubscriptionType()
    },
    directives: {
      description: "A list of all directives supported by this server.",
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__Directive))),
      resolve: (schema) => schema.getDirectives()
    }
  })
});
var __Directive = new GraphQLObjectType({
  name: "__Directive",
  description: `A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.

In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.`,
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (directive) => directive.name
    },
    description: {
      type: GraphQLString,
      resolve: (directive) => directive.description
    },
    isRepeatable: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (directive) => directive.isRepeatable
    },
    locations: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__DirectiveLocation))),
      resolve: (directive) => directive.locations
    },
    args: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
      args: {
        includeDeprecated: {
          type: GraphQLBoolean,
          defaultValue: false
        }
      },
      resolve(field, { includeDeprecated }) {
        return includeDeprecated ? field.args : field.args.filter((arg) => arg.deprecationReason == null);
      }
    }
  })
});
var __DirectiveLocation = new GraphQLEnumType({
  name: "__DirectiveLocation",
  description: "A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.",
  values: {
    QUERY: {
      value: DirectiveLocation.QUERY,
      description: "Location adjacent to a query operation."
    },
    MUTATION: {
      value: DirectiveLocation.MUTATION,
      description: "Location adjacent to a mutation operation."
    },
    SUBSCRIPTION: {
      value: DirectiveLocation.SUBSCRIPTION,
      description: "Location adjacent to a subscription operation."
    },
    FIELD: {
      value: DirectiveLocation.FIELD,
      description: "Location adjacent to a field."
    },
    FRAGMENT_DEFINITION: {
      value: DirectiveLocation.FRAGMENT_DEFINITION,
      description: "Location adjacent to a fragment definition."
    },
    FRAGMENT_SPREAD: {
      value: DirectiveLocation.FRAGMENT_SPREAD,
      description: "Location adjacent to a fragment spread."
    },
    INLINE_FRAGMENT: {
      value: DirectiveLocation.INLINE_FRAGMENT,
      description: "Location adjacent to an inline fragment."
    },
    VARIABLE_DEFINITION: {
      value: DirectiveLocation.VARIABLE_DEFINITION,
      description: "Location adjacent to a variable definition."
    },
    SCHEMA: {
      value: DirectiveLocation.SCHEMA,
      description: "Location adjacent to a schema definition."
    },
    SCALAR: {
      value: DirectiveLocation.SCALAR,
      description: "Location adjacent to a scalar definition."
    },
    OBJECT: {
      value: DirectiveLocation.OBJECT,
      description: "Location adjacent to an object type definition."
    },
    FIELD_DEFINITION: {
      value: DirectiveLocation.FIELD_DEFINITION,
      description: "Location adjacent to a field definition."
    },
    ARGUMENT_DEFINITION: {
      value: DirectiveLocation.ARGUMENT_DEFINITION,
      description: "Location adjacent to an argument definition."
    },
    INTERFACE: {
      value: DirectiveLocation.INTERFACE,
      description: "Location adjacent to an interface definition."
    },
    UNION: {
      value: DirectiveLocation.UNION,
      description: "Location adjacent to a union definition."
    },
    ENUM: {
      value: DirectiveLocation.ENUM,
      description: "Location adjacent to an enum definition."
    },
    ENUM_VALUE: {
      value: DirectiveLocation.ENUM_VALUE,
      description: "Location adjacent to an enum value definition."
    },
    INPUT_OBJECT: {
      value: DirectiveLocation.INPUT_OBJECT,
      description: "Location adjacent to an input object type definition."
    },
    INPUT_FIELD_DEFINITION: {
      value: DirectiveLocation.INPUT_FIELD_DEFINITION,
      description: "Location adjacent to an input object field definition."
    }
  }
});
var __Type = new GraphQLObjectType({
  name: "__Type",
  description: "The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the `__TypeKind` enum.\n\nDepending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional `specifiedByURL`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.",
  fields: () => ({
    kind: {
      type: new GraphQLNonNull(__TypeKind),
      resolve(type) {
        if (isScalarType(type)) {
          return TypeKind.SCALAR;
        }
        if (isObjectType(type)) {
          return TypeKind.OBJECT;
        }
        if (isInterfaceType(type)) {
          return TypeKind.INTERFACE;
        }
        if (isUnionType(type)) {
          return TypeKind.UNION;
        }
        if (isEnumType(type)) {
          return TypeKind.ENUM;
        }
        if (isInputObjectType(type)) {
          return TypeKind.INPUT_OBJECT;
        }
        if (isListType(type)) {
          return TypeKind.LIST;
        }
        if (isNonNullType(type)) {
          return TypeKind.NON_NULL;
        }
        invariant(false, `Unexpected type: "${inspect(type)}".`);
      }
    },
    name: {
      type: GraphQLString,
      resolve: (type) => ("name" in type) ? type.name : undefined
    },
    description: {
      type: GraphQLString,
      resolve: (type) => ("description" in type) ? type.description : undefined
    },
    specifiedByURL: {
      type: GraphQLString,
      resolve: (obj) => ("specifiedByURL" in obj) ? obj.specifiedByURL : undefined
    },
    fields: {
      type: new GraphQLList(new GraphQLNonNull(__Field)),
      args: {
        includeDeprecated: {
          type: GraphQLBoolean,
          defaultValue: false
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isObjectType(type) || isInterfaceType(type)) {
          const fields = Object.values(type.getFields());
          return includeDeprecated ? fields : fields.filter((field) => field.deprecationReason == null);
        }
      }
    },
    interfaces: {
      type: new GraphQLList(new GraphQLNonNull(__Type)),
      resolve(type) {
        if (isObjectType(type) || isInterfaceType(type)) {
          return type.getInterfaces();
        }
      }
    },
    possibleTypes: {
      type: new GraphQLList(new GraphQLNonNull(__Type)),
      resolve(type, _args, _context, { schema }) {
        if (isAbstractType(type)) {
          return schema.getPossibleTypes(type);
        }
      }
    },
    enumValues: {
      type: new GraphQLList(new GraphQLNonNull(__EnumValue)),
      args: {
        includeDeprecated: {
          type: GraphQLBoolean,
          defaultValue: false
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isEnumType(type)) {
          const values = type.getValues();
          return includeDeprecated ? values : values.filter((field) => field.deprecationReason == null);
        }
      }
    },
    inputFields: {
      type: new GraphQLList(new GraphQLNonNull(__InputValue)),
      args: {
        includeDeprecated: {
          type: GraphQLBoolean,
          defaultValue: false
        }
      },
      resolve(type, { includeDeprecated }) {
        if (isInputObjectType(type)) {
          const values = Object.values(type.getFields());
          return includeDeprecated ? values : values.filter((field) => field.deprecationReason == null);
        }
      }
    },
    ofType: {
      type: __Type,
      resolve: (type) => ("ofType" in type) ? type.ofType : undefined
    },
    isOneOf: {
      type: GraphQLBoolean,
      resolve: (type) => {
        if (isInputObjectType(type)) {
          return type.isOneOf;
        }
      }
    }
  })
});
var __Field = new GraphQLObjectType({
  name: "__Field",
  description: "Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (field) => field.name
    },
    description: {
      type: GraphQLString,
      resolve: (field) => field.description
    },
    args: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(__InputValue))),
      args: {
        includeDeprecated: {
          type: GraphQLBoolean,
          defaultValue: false
        }
      },
      resolve(field, { includeDeprecated }) {
        return includeDeprecated ? field.args : field.args.filter((arg) => arg.deprecationReason == null);
      }
    },
    type: {
      type: new GraphQLNonNull(__Type),
      resolve: (field) => field.type
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (field) => field.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (field) => field.deprecationReason
    }
  })
});
var __InputValue = new GraphQLObjectType({
  name: "__InputValue",
  description: "Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (inputValue) => inputValue.name
    },
    description: {
      type: GraphQLString,
      resolve: (inputValue) => inputValue.description
    },
    type: {
      type: new GraphQLNonNull(__Type),
      resolve: (inputValue) => inputValue.type
    },
    defaultValue: {
      type: GraphQLString,
      description: "A GraphQL-formatted string representing the default value for this input value.",
      resolve(inputValue) {
        const { type, defaultValue } = inputValue;
        const valueAST = astFromValue(defaultValue, type);
        return valueAST ? print(valueAST) : null;
      }
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (field) => field.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (obj) => obj.deprecationReason
    }
  })
});
var __EnumValue = new GraphQLObjectType({
  name: "__EnumValue",
  description: "One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: (enumValue) => enumValue.name
    },
    description: {
      type: GraphQLString,
      resolve: (enumValue) => enumValue.description
    },
    isDeprecated: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: (enumValue) => enumValue.deprecationReason != null
    },
    deprecationReason: {
      type: GraphQLString,
      resolve: (enumValue) => enumValue.deprecationReason
    }
  })
});
var TypeKind;
(function(TypeKind) {
  TypeKind["SCALAR"] = "SCALAR";
  TypeKind["OBJECT"] = "OBJECT";
  TypeKind["INTERFACE"] = "INTERFACE";
  TypeKind["UNION"] = "UNION";
  TypeKind["ENUM"] = "ENUM";
  TypeKind["INPUT_OBJECT"] = "INPUT_OBJECT";
  TypeKind["LIST"] = "LIST";
  TypeKind["NON_NULL"] = "NON_NULL";
})(TypeKind || (TypeKind = {}));
var __TypeKind = new GraphQLEnumType({
  name: "__TypeKind",
  description: "An enum describing what kind of type a given `__Type` is.",
  values: {
    SCALAR: {
      value: TypeKind.SCALAR,
      description: "Indicates this type is a scalar."
    },
    OBJECT: {
      value: TypeKind.OBJECT,
      description: "Indicates this type is an object. `fields` and `interfaces` are valid fields."
    },
    INTERFACE: {
      value: TypeKind.INTERFACE,
      description: "Indicates this type is an interface. `fields`, `interfaces`, and `possibleTypes` are valid fields."
    },
    UNION: {
      value: TypeKind.UNION,
      description: "Indicates this type is a union. `possibleTypes` is a valid field."
    },
    ENUM: {
      value: TypeKind.ENUM,
      description: "Indicates this type is an enum. `enumValues` is a valid field."
    },
    INPUT_OBJECT: {
      value: TypeKind.INPUT_OBJECT,
      description: "Indicates this type is an input object. `inputFields` is a valid field."
    },
    LIST: {
      value: TypeKind.LIST,
      description: "Indicates this type is a list. `ofType` is a valid field."
    },
    NON_NULL: {
      value: TypeKind.NON_NULL,
      description: "Indicates this type is a non-null. `ofType` is a valid field."
    }
  }
});
var SchemaMetaFieldDef = {
  name: "__schema",
  type: new GraphQLNonNull(__Schema),
  description: "Access the current type schema of this server.",
  args: [],
  resolve: (_source, _args, _context, { schema }) => schema,
  deprecationReason: undefined,
  extensions: Object.create(null),
  astNode: undefined
};
var TypeMetaFieldDef = {
  name: "__type",
  type: __Type,
  description: "Request the type information of a single type.",
  args: [
    {
      name: "name",
      description: undefined,
      type: new GraphQLNonNull(GraphQLString),
      defaultValue: undefined,
      deprecationReason: undefined,
      extensions: Object.create(null),
      astNode: undefined
    }
  ],
  resolve: (_source, { name }, _context, { schema }) => schema.getType(name),
  deprecationReason: undefined,
  extensions: Object.create(null),
  astNode: undefined
};
var TypeNameMetaFieldDef = {
  name: "__typename",
  type: new GraphQLNonNull(GraphQLString),
  description: "The name of the current Object type at runtime.",
  args: [],
  resolve: (_source, _args, _context, { parentType }) => parentType.name,
  deprecationReason: undefined,
  extensions: Object.create(null),
  astNode: undefined
};
var introspectionTypes = Object.freeze([
  __Schema,
  __Directive,
  __DirectiveLocation,
  __Type,
  __Field,
  __InputValue,
  __EnumValue,
  __TypeKind
]);
function isIntrospectionType(type) {
  return introspectionTypes.some(({ name }) => type.name === name);
}

// node_modules/graphql/type/schema.mjs
function isSchema(schema) {
  return instanceOf(schema, GraphQLSchema);
}
function assertSchema(schema) {
  if (!isSchema(schema)) {
    throw new Error(`Expected ${inspect(schema)} to be a GraphQL schema.`);
  }
  return schema;
}

class GraphQLSchema {
  constructor(config) {
    var _config$extensionASTN, _config$directives;
    this.__validationErrors = config.assumeValid === true ? [] : undefined;
    isObjectLike(config) || devAssert(false, "Must provide configuration object.");
    !config.types || Array.isArray(config.types) || devAssert(false, `"types" must be Array if provided but got: ${inspect(config.types)}.`);
    !config.directives || Array.isArray(config.directives) || devAssert(false, '"directives" must be Array if provided but got: ' + `${inspect(config.directives)}.`);
    this.description = config.description;
    this.extensions = toObjMap(config.extensions);
    this.astNode = config.astNode;
    this.extensionASTNodes = (_config$extensionASTN = config.extensionASTNodes) !== null && _config$extensionASTN !== undefined ? _config$extensionASTN : [];
    this._queryType = config.query;
    this._mutationType = config.mutation;
    this._subscriptionType = config.subscription;
    this._directives = (_config$directives = config.directives) !== null && _config$directives !== undefined ? _config$directives : specifiedDirectives;
    const allReferencedTypes = new Set(config.types);
    if (config.types != null) {
      for (const type of config.types) {
        allReferencedTypes.delete(type);
        collectReferencedTypes(type, allReferencedTypes);
      }
    }
    if (this._queryType != null) {
      collectReferencedTypes(this._queryType, allReferencedTypes);
    }
    if (this._mutationType != null) {
      collectReferencedTypes(this._mutationType, allReferencedTypes);
    }
    if (this._subscriptionType != null) {
      collectReferencedTypes(this._subscriptionType, allReferencedTypes);
    }
    for (const directive of this._directives) {
      if (isDirective(directive)) {
        for (const arg of directive.args) {
          collectReferencedTypes(arg.type, allReferencedTypes);
        }
      }
    }
    collectReferencedTypes(__Schema, allReferencedTypes);
    this._typeMap = Object.create(null);
    this._subTypeMap = Object.create(null);
    this._implementationsMap = Object.create(null);
    for (const namedType of allReferencedTypes) {
      if (namedType == null) {
        continue;
      }
      const typeName = namedType.name;
      typeName || devAssert(false, "One of the provided types for building the Schema is missing a name.");
      if (this._typeMap[typeName] !== undefined) {
        throw new Error(`Schema must contain uniquely named types but contains multiple types named "${typeName}".`);
      }
      this._typeMap[typeName] = namedType;
      if (isInterfaceType(namedType)) {
        for (const iface of namedType.getInterfaces()) {
          if (isInterfaceType(iface)) {
            let implementations = this._implementationsMap[iface.name];
            if (implementations === undefined) {
              implementations = this._implementationsMap[iface.name] = {
                objects: [],
                interfaces: []
              };
            }
            implementations.interfaces.push(namedType);
          }
        }
      } else if (isObjectType(namedType)) {
        for (const iface of namedType.getInterfaces()) {
          if (isInterfaceType(iface)) {
            let implementations = this._implementationsMap[iface.name];
            if (implementations === undefined) {
              implementations = this._implementationsMap[iface.name] = {
                objects: [],
                interfaces: []
              };
            }
            implementations.objects.push(namedType);
          }
        }
      }
    }
  }
  get [Symbol.toStringTag]() {
    return "GraphQLSchema";
  }
  getQueryType() {
    return this._queryType;
  }
  getMutationType() {
    return this._mutationType;
  }
  getSubscriptionType() {
    return this._subscriptionType;
  }
  getRootType(operation) {
    switch (operation) {
      case OperationTypeNode.QUERY:
        return this.getQueryType();
      case OperationTypeNode.MUTATION:
        return this.getMutationType();
      case OperationTypeNode.SUBSCRIPTION:
        return this.getSubscriptionType();
    }
  }
  getTypeMap() {
    return this._typeMap;
  }
  getType(name) {
    return this.getTypeMap()[name];
  }
  getPossibleTypes(abstractType) {
    return isUnionType(abstractType) ? abstractType.getTypes() : this.getImplementations(abstractType).objects;
  }
  getImplementations(interfaceType) {
    const implementations = this._implementationsMap[interfaceType.name];
    return implementations !== null && implementations !== undefined ? implementations : {
      objects: [],
      interfaces: []
    };
  }
  isSubType(abstractType, maybeSubType) {
    let map = this._subTypeMap[abstractType.name];
    if (map === undefined) {
      map = Object.create(null);
      if (isUnionType(abstractType)) {
        for (const type of abstractType.getTypes()) {
          map[type.name] = true;
        }
      } else {
        const implementations = this.getImplementations(abstractType);
        for (const type of implementations.objects) {
          map[type.name] = true;
        }
        for (const type of implementations.interfaces) {
          map[type.name] = true;
        }
      }
      this._subTypeMap[abstractType.name] = map;
    }
    return map[maybeSubType.name] !== undefined;
  }
  getDirectives() {
    return this._directives;
  }
  getDirective(name) {
    return this.getDirectives().find((directive) => directive.name === name);
  }
  toConfig() {
    return {
      description: this.description,
      query: this.getQueryType(),
      mutation: this.getMutationType(),
      subscription: this.getSubscriptionType(),
      types: Object.values(this.getTypeMap()),
      directives: this.getDirectives(),
      extensions: this.extensions,
      astNode: this.astNode,
      extensionASTNodes: this.extensionASTNodes,
      assumeValid: this.__validationErrors !== undefined
    };
  }
}
function collectReferencedTypes(type, typeSet) {
  const namedType = getNamedType(type);
  if (!typeSet.has(namedType)) {
    typeSet.add(namedType);
    if (isUnionType(namedType)) {
      for (const memberType of namedType.getTypes()) {
        collectReferencedTypes(memberType, typeSet);
      }
    } else if (isObjectType(namedType) || isInterfaceType(namedType)) {
      for (const interfaceType of namedType.getInterfaces()) {
        collectReferencedTypes(interfaceType, typeSet);
      }
      for (const field of Object.values(namedType.getFields())) {
        collectReferencedTypes(field.type, typeSet);
        for (const arg of field.args) {
          collectReferencedTypes(arg.type, typeSet);
        }
      }
    } else if (isInputObjectType(namedType)) {
      for (const field of Object.values(namedType.getFields())) {
        collectReferencedTypes(field.type, typeSet);
      }
    }
  }
  return typeSet;
}
// node_modules/graphql/utilities/typeComparators.mjs
function isEqualType(typeA, typeB) {
  if (typeA === typeB) {
    return true;
  }
  if (isNonNullType(typeA) && isNonNullType(typeB)) {
    return isEqualType(typeA.ofType, typeB.ofType);
  }
  if (isListType(typeA) && isListType(typeB)) {
    return isEqualType(typeA.ofType, typeB.ofType);
  }
  return false;
}
function isTypeSubTypeOf(schema, maybeSubType, superType) {
  if (maybeSubType === superType) {
    return true;
  }
  if (isNonNullType(superType)) {
    if (isNonNullType(maybeSubType)) {
      return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isNonNullType(maybeSubType)) {
    return isTypeSubTypeOf(schema, maybeSubType.ofType, superType);
  }
  if (isListType(superType)) {
    if (isListType(maybeSubType)) {
      return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
    }
    return false;
  }
  if (isListType(maybeSubType)) {
    return false;
  }
  return isAbstractType(superType) && (isInterfaceType(maybeSubType) || isObjectType(maybeSubType)) && schema.isSubType(superType, maybeSubType);
}
function doTypesOverlap(schema, typeA, typeB) {
  if (typeA === typeB) {
    return true;
  }
  if (isAbstractType(typeA)) {
    if (isAbstractType(typeB)) {
      return schema.getPossibleTypes(typeA).some((type) => schema.isSubType(typeB, type));
    }
    return schema.isSubType(typeA, typeB);
  }
  if (isAbstractType(typeB)) {
    return schema.isSubType(typeB, typeA);
  }
  return false;
}

// node_modules/graphql/type/validate.mjs
function validateSchema(schema) {
  assertSchema(schema);
  if (schema.__validationErrors) {
    return schema.__validationErrors;
  }
  const context = new SchemaValidationContext(schema);
  validateRootTypes(context);
  validateDirectives(context);
  validateTypes(context);
  const errors = context.getErrors();
  schema.__validationErrors = errors;
  return errors;
}
function assertValidSchema(schema) {
  const errors = validateSchema(schema);
  if (errors.length !== 0) {
    throw new Error(errors.map((error) => error.message).join(`

`));
  }
}

class SchemaValidationContext {
  constructor(schema) {
    this._errors = [];
    this.schema = schema;
  }
  reportError(message, nodes) {
    const _nodes = Array.isArray(nodes) ? nodes.filter(Boolean) : nodes;
    this._errors.push(new GraphQLError(message, {
      nodes: _nodes
    }));
  }
  getErrors() {
    return this._errors;
  }
}
function validateRootTypes(context) {
  const schema = context.schema;
  const queryType = schema.getQueryType();
  if (!queryType) {
    context.reportError("Query root type must be provided.", schema.astNode);
  } else if (!isObjectType(queryType)) {
    var _getOperationTypeNode;
    context.reportError(`Query root type must be Object type, it cannot be ${inspect(queryType)}.`, (_getOperationTypeNode = getOperationTypeNode(schema, OperationTypeNode.QUERY)) !== null && _getOperationTypeNode !== undefined ? _getOperationTypeNode : queryType.astNode);
  }
  const mutationType = schema.getMutationType();
  if (mutationType && !isObjectType(mutationType)) {
    var _getOperationTypeNode2;
    context.reportError("Mutation root type must be Object type if provided, it cannot be " + `${inspect(mutationType)}.`, (_getOperationTypeNode2 = getOperationTypeNode(schema, OperationTypeNode.MUTATION)) !== null && _getOperationTypeNode2 !== undefined ? _getOperationTypeNode2 : mutationType.astNode);
  }
  const subscriptionType = schema.getSubscriptionType();
  if (subscriptionType && !isObjectType(subscriptionType)) {
    var _getOperationTypeNode3;
    context.reportError("Subscription root type must be Object type if provided, it cannot be " + `${inspect(subscriptionType)}.`, (_getOperationTypeNode3 = getOperationTypeNode(schema, OperationTypeNode.SUBSCRIPTION)) !== null && _getOperationTypeNode3 !== undefined ? _getOperationTypeNode3 : subscriptionType.astNode);
  }
}
function getOperationTypeNode(schema, operation) {
  var _flatMap$find;
  return (_flatMap$find = [schema.astNode, ...schema.extensionASTNodes].flatMap((schemaNode) => {
    var _schemaNode$operation;
    return (_schemaNode$operation = schemaNode === null || schemaNode === undefined ? undefined : schemaNode.operationTypes) !== null && _schemaNode$operation !== undefined ? _schemaNode$operation : [];
  }).find((operationNode) => operationNode.operation === operation)) === null || _flatMap$find === undefined ? undefined : _flatMap$find.type;
}
function validateDirectives(context) {
  for (const directive of context.schema.getDirectives()) {
    if (!isDirective(directive)) {
      context.reportError(`Expected directive but got: ${inspect(directive)}.`, directive === null || directive === undefined ? undefined : directive.astNode);
      continue;
    }
    validateName(context, directive);
    if (directive.locations.length === 0) {
      context.reportError(`Directive @${directive.name} must include 1 or more locations.`, directive.astNode);
    }
    for (const arg of directive.args) {
      validateName(context, arg);
      if (!isInputType(arg.type)) {
        context.reportError(`The type of @${directive.name}(${arg.name}:) must be Input Type ` + `but got: ${inspect(arg.type)}.`, arg.astNode);
      }
      if (isRequiredArgument(arg) && arg.deprecationReason != null) {
        var _arg$astNode;
        context.reportError(`Required argument @${directive.name}(${arg.name}:) cannot be deprecated.`, [
          getDeprecatedDirectiveNode(arg.astNode),
          (_arg$astNode = arg.astNode) === null || _arg$astNode === undefined ? undefined : _arg$astNode.type
        ]);
      }
    }
  }
}
function validateName(context, node) {
  if (node.name.startsWith("__")) {
    context.reportError(`Name "${node.name}" must not begin with "__", which is reserved by GraphQL introspection.`, node.astNode);
  }
}
function validateTypes(context) {
  const validateInputObjectCircularRefs = createInputObjectCircularRefsValidator(context);
  const typeMap = context.schema.getTypeMap();
  for (const type of Object.values(typeMap)) {
    if (!isNamedType(type)) {
      context.reportError(`Expected GraphQL named type but got: ${inspect(type)}.`, type.astNode);
      continue;
    }
    if (!isIntrospectionType(type)) {
      validateName(context, type);
    }
    if (isObjectType(type)) {
      validateFields(context, type);
      validateInterfaces(context, type);
    } else if (isInterfaceType(type)) {
      validateFields(context, type);
      validateInterfaces(context, type);
    } else if (isUnionType(type)) {
      validateUnionMembers(context, type);
    } else if (isEnumType(type)) {
      validateEnumValues(context, type);
    } else if (isInputObjectType(type)) {
      validateInputFields(context, type);
      validateInputObjectCircularRefs(type);
    }
  }
}
function validateFields(context, type) {
  const fields = Object.values(type.getFields());
  if (fields.length === 0) {
    context.reportError(`Type ${type.name} must define one or more fields.`, [
      type.astNode,
      ...type.extensionASTNodes
    ]);
  }
  for (const field of fields) {
    validateName(context, field);
    if (!isOutputType(field.type)) {
      var _field$astNode;
      context.reportError(`The type of ${type.name}.${field.name} must be Output Type ` + `but got: ${inspect(field.type)}.`, (_field$astNode = field.astNode) === null || _field$astNode === undefined ? undefined : _field$astNode.type);
    }
    for (const arg of field.args) {
      const argName = arg.name;
      validateName(context, arg);
      if (!isInputType(arg.type)) {
        var _arg$astNode2;
        context.reportError(`The type of ${type.name}.${field.name}(${argName}:) must be Input ` + `Type but got: ${inspect(arg.type)}.`, (_arg$astNode2 = arg.astNode) === null || _arg$astNode2 === undefined ? undefined : _arg$astNode2.type);
      }
      if (isRequiredArgument(arg) && arg.deprecationReason != null) {
        var _arg$astNode3;
        context.reportError(`Required argument ${type.name}.${field.name}(${argName}:) cannot be deprecated.`, [
          getDeprecatedDirectiveNode(arg.astNode),
          (_arg$astNode3 = arg.astNode) === null || _arg$astNode3 === undefined ? undefined : _arg$astNode3.type
        ]);
      }
    }
  }
}
function validateInterfaces(context, type) {
  const ifaceTypeNames = Object.create(null);
  for (const iface of type.getInterfaces()) {
    if (!isInterfaceType(iface)) {
      context.reportError(`Type ${inspect(type)} must only implement Interface types, ` + `it cannot implement ${inspect(iface)}.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    if (type === iface) {
      context.reportError(`Type ${type.name} cannot implement itself because it would create a circular reference.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    if (ifaceTypeNames[iface.name]) {
      context.reportError(`Type ${type.name} can only implement ${iface.name} once.`, getAllImplementsInterfaceNodes(type, iface));
      continue;
    }
    ifaceTypeNames[iface.name] = true;
    validateTypeImplementsAncestors(context, type, iface);
    validateTypeImplementsInterface(context, type, iface);
  }
}
function validateTypeImplementsInterface(context, type, iface) {
  const typeFieldMap = type.getFields();
  for (const ifaceField of Object.values(iface.getFields())) {
    const fieldName = ifaceField.name;
    const typeField = typeFieldMap[fieldName];
    if (!typeField) {
      context.reportError(`Interface field ${iface.name}.${fieldName} expected but ${type.name} does not provide it.`, [ifaceField.astNode, type.astNode, ...type.extensionASTNodes]);
      continue;
    }
    if (!isTypeSubTypeOf(context.schema, typeField.type, ifaceField.type)) {
      var _ifaceField$astNode, _typeField$astNode;
      context.reportError(`Interface field ${iface.name}.${fieldName} expects type ` + `${inspect(ifaceField.type)} but ${type.name}.${fieldName} ` + `is type ${inspect(typeField.type)}.`, [
        (_ifaceField$astNode = ifaceField.astNode) === null || _ifaceField$astNode === undefined ? undefined : _ifaceField$astNode.type,
        (_typeField$astNode = typeField.astNode) === null || _typeField$astNode === undefined ? undefined : _typeField$astNode.type
      ]);
    }
    for (const ifaceArg of ifaceField.args) {
      const argName = ifaceArg.name;
      const typeArg = typeField.args.find((arg) => arg.name === argName);
      if (!typeArg) {
        context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) expected but ${type.name}.${fieldName} does not provide it.`, [ifaceArg.astNode, typeField.astNode]);
        continue;
      }
      if (!isEqualType(ifaceArg.type, typeArg.type)) {
        var _ifaceArg$astNode, _typeArg$astNode;
        context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) ` + `expects type ${inspect(ifaceArg.type)} but ` + `${type.name}.${fieldName}(${argName}:) is type ` + `${inspect(typeArg.type)}.`, [
          (_ifaceArg$astNode = ifaceArg.astNode) === null || _ifaceArg$astNode === undefined ? undefined : _ifaceArg$astNode.type,
          (_typeArg$astNode = typeArg.astNode) === null || _typeArg$astNode === undefined ? undefined : _typeArg$astNode.type
        ]);
      }
    }
    for (const typeArg of typeField.args) {
      const argName = typeArg.name;
      const ifaceArg = ifaceField.args.find((arg) => arg.name === argName);
      if (!ifaceArg && isRequiredArgument(typeArg)) {
        context.reportError(`Object field ${type.name}.${fieldName} includes required argument ${argName} that is missing from the Interface field ${iface.name}.${fieldName}.`, [typeArg.astNode, ifaceField.astNode]);
      }
    }
  }
}
function validateTypeImplementsAncestors(context, type, iface) {
  const ifaceInterfaces = type.getInterfaces();
  for (const transitive of iface.getInterfaces()) {
    if (!ifaceInterfaces.includes(transitive)) {
      context.reportError(transitive === type ? `Type ${type.name} cannot implement ${iface.name} because it would create a circular reference.` : `Type ${type.name} must implement ${transitive.name} because it is implemented by ${iface.name}.`, [
        ...getAllImplementsInterfaceNodes(iface, transitive),
        ...getAllImplementsInterfaceNodes(type, iface)
      ]);
    }
  }
}
function validateUnionMembers(context, union) {
  const memberTypes = union.getTypes();
  if (memberTypes.length === 0) {
    context.reportError(`Union type ${union.name} must define one or more member types.`, [union.astNode, ...union.extensionASTNodes]);
  }
  const includedTypeNames = Object.create(null);
  for (const memberType of memberTypes) {
    if (includedTypeNames[memberType.name]) {
      context.reportError(`Union type ${union.name} can only include type ${memberType.name} once.`, getUnionMemberTypeNodes(union, memberType.name));
      continue;
    }
    includedTypeNames[memberType.name] = true;
    if (!isObjectType(memberType)) {
      context.reportError(`Union type ${union.name} can only include Object types, ` + `it cannot include ${inspect(memberType)}.`, getUnionMemberTypeNodes(union, String(memberType)));
    }
  }
}
function validateEnumValues(context, enumType) {
  const enumValues = enumType.getValues();
  if (enumValues.length === 0) {
    context.reportError(`Enum type ${enumType.name} must define one or more values.`, [enumType.astNode, ...enumType.extensionASTNodes]);
  }
  for (const enumValue of enumValues) {
    validateName(context, enumValue);
  }
}
function validateInputFields(context, inputObj) {
  const fields = Object.values(inputObj.getFields());
  if (fields.length === 0) {
    context.reportError(`Input Object type ${inputObj.name} must define one or more fields.`, [inputObj.astNode, ...inputObj.extensionASTNodes]);
  }
  for (const field of fields) {
    validateName(context, field);
    if (!isInputType(field.type)) {
      var _field$astNode2;
      context.reportError(`The type of ${inputObj.name}.${field.name} must be Input Type ` + `but got: ${inspect(field.type)}.`, (_field$astNode2 = field.astNode) === null || _field$astNode2 === undefined ? undefined : _field$astNode2.type);
    }
    if (isRequiredInputField(field) && field.deprecationReason != null) {
      var _field$astNode3;
      context.reportError(`Required input field ${inputObj.name}.${field.name} cannot be deprecated.`, [
        getDeprecatedDirectiveNode(field.astNode),
        (_field$astNode3 = field.astNode) === null || _field$astNode3 === undefined ? undefined : _field$astNode3.type
      ]);
    }
    if (inputObj.isOneOf) {
      validateOneOfInputObjectField(inputObj, field, context);
    }
  }
}
function validateOneOfInputObjectField(type, field, context) {
  if (isNonNullType(field.type)) {
    var _field$astNode4;
    context.reportError(`OneOf input field ${type.name}.${field.name} must be nullable.`, (_field$astNode4 = field.astNode) === null || _field$astNode4 === undefined ? undefined : _field$astNode4.type);
  }
  if (field.defaultValue !== undefined) {
    context.reportError(`OneOf input field ${type.name}.${field.name} cannot have a default value.`, field.astNode);
  }
}
function createInputObjectCircularRefsValidator(context) {
  const visitedTypes = Object.create(null);
  const fieldPath = [];
  const fieldPathIndexByTypeName = Object.create(null);
  return detectCycleRecursive;
  function detectCycleRecursive(inputObj) {
    if (visitedTypes[inputObj.name]) {
      return;
    }
    visitedTypes[inputObj.name] = true;
    fieldPathIndexByTypeName[inputObj.name] = fieldPath.length;
    const fields = Object.values(inputObj.getFields());
    for (const field of fields) {
      if (isNonNullType(field.type) && isInputObjectType(field.type.ofType)) {
        const fieldType = field.type.ofType;
        const cycleIndex = fieldPathIndexByTypeName[fieldType.name];
        fieldPath.push(field);
        if (cycleIndex === undefined) {
          detectCycleRecursive(fieldType);
        } else {
          const cyclePath = fieldPath.slice(cycleIndex);
          const pathStr = cyclePath.map((fieldObj) => fieldObj.name).join(".");
          context.reportError(`Cannot reference Input Object "${fieldType.name}" within itself through a series of non-null fields: "${pathStr}".`, cyclePath.map((fieldObj) => fieldObj.astNode));
        }
        fieldPath.pop();
      }
    }
    fieldPathIndexByTypeName[inputObj.name] = undefined;
  }
}
function getAllImplementsInterfaceNodes(type, iface) {
  const { astNode, extensionASTNodes } = type;
  const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
  return nodes.flatMap((typeNode) => {
    var _typeNode$interfaces;
    return (_typeNode$interfaces = typeNode.interfaces) !== null && _typeNode$interfaces !== undefined ? _typeNode$interfaces : [];
  }).filter((ifaceNode) => ifaceNode.name.value === iface.name);
}
function getUnionMemberTypeNodes(union, typeName) {
  const { astNode, extensionASTNodes } = union;
  const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
  return nodes.flatMap((unionNode) => {
    var _unionNode$types;
    return (_unionNode$types = unionNode.types) !== null && _unionNode$types !== undefined ? _unionNode$types : [];
  }).filter((typeNode) => typeNode.name.value === typeName);
}
function getDeprecatedDirectiveNode(definitionNode) {
  var _definitionNode$direc;
  return definitionNode === null || definitionNode === undefined ? undefined : (_definitionNode$direc = definitionNode.directives) === null || _definitionNode$direc === undefined ? undefined : _definitionNode$direc.find((node) => node.name.value === GraphQLDeprecatedDirective.name);
}
// node_modules/graphql/language/source.mjs
class Source {
  constructor(body, name = "GraphQL request", locationOffset = {
    line: 1,
    column: 1
  }) {
    typeof body === "string" || devAssert(false, `Body must be a string. Received: ${inspect(body)}.`);
    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.locationOffset.line > 0 || devAssert(false, "line in locationOffset is 1-indexed and must be positive.");
    this.locationOffset.column > 0 || devAssert(false, "column in locationOffset is 1-indexed and must be positive.");
  }
  get [Symbol.toStringTag]() {
    return "Source";
  }
}
function isSource(source) {
  return instanceOf(source, Source);
}
// node_modules/graphql/language/tokenKind.mjs
var TokenKind;
(function(TokenKind) {
  TokenKind["SOF"] = "<SOF>";
  TokenKind["EOF"] = "<EOF>";
  TokenKind["BANG"] = "!";
  TokenKind["DOLLAR"] = "$";
  TokenKind["AMP"] = "&";
  TokenKind["PAREN_L"] = "(";
  TokenKind["PAREN_R"] = ")";
  TokenKind["SPREAD"] = "...";
  TokenKind["COLON"] = ":";
  TokenKind["EQUALS"] = "=";
  TokenKind["AT"] = "@";
  TokenKind["BRACKET_L"] = "[";
  TokenKind["BRACKET_R"] = "]";
  TokenKind["BRACE_L"] = "{";
  TokenKind["PIPE"] = "|";
  TokenKind["BRACE_R"] = "}";
  TokenKind["NAME"] = "Name";
  TokenKind["INT"] = "Int";
  TokenKind["FLOAT"] = "Float";
  TokenKind["STRING"] = "String";
  TokenKind["BLOCK_STRING"] = "BlockString";
  TokenKind["COMMENT"] = "Comment";
})(TokenKind || (TokenKind = {}));

// node_modules/graphql/error/syntaxError.mjs
function syntaxError(source, position, description) {
  return new GraphQLError(`Syntax Error: ${description}`, {
    source,
    positions: [position]
  });
}

// node_modules/graphql/language/lexer.mjs
class Lexer {
  constructor(source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }
  get [Symbol.toStringTag]() {
    return "Lexer";
  }
  advance() {
    this.lastToken = this.token;
    const token = this.token = this.lookahead();
    return token;
  }
  lookahead() {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        if (token.next) {
          token = token.next;
        } else {
          const nextToken = readNextToken(this, token.end);
          token.next = nextToken;
          nextToken.prev = token;
          token = nextToken;
        }
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  }
}
function isPunctuatorTokenKind(kind) {
  return kind === TokenKind.BANG || kind === TokenKind.DOLLAR || kind === TokenKind.AMP || kind === TokenKind.PAREN_L || kind === TokenKind.PAREN_R || kind === TokenKind.SPREAD || kind === TokenKind.COLON || kind === TokenKind.EQUALS || kind === TokenKind.AT || kind === TokenKind.BRACKET_L || kind === TokenKind.BRACKET_R || kind === TokenKind.BRACE_L || kind === TokenKind.PIPE || kind === TokenKind.BRACE_R;
}
function isUnicodeScalarValue(code) {
  return code >= 0 && code <= 55295 || code >= 57344 && code <= 1114111;
}
function isSupplementaryCodePoint(body, location) {
  return isLeadingSurrogate(body.charCodeAt(location)) && isTrailingSurrogate(body.charCodeAt(location + 1));
}
function isLeadingSurrogate(code) {
  return code >= 55296 && code <= 56319;
}
function isTrailingSurrogate(code) {
  return code >= 56320 && code <= 57343;
}
function printCodePointAt(lexer, location) {
  const code = lexer.source.body.codePointAt(location);
  if (code === undefined) {
    return TokenKind.EOF;
  } else if (code >= 32 && code <= 126) {
    const char = String.fromCodePoint(code);
    return char === '"' ? `'"'` : `"${char}"`;
  }
  return "U+" + code.toString(16).toUpperCase().padStart(4, "0");
}
function createToken(lexer, kind, start, end, value) {
  const line = lexer.line;
  const col = 1 + start - lexer.lineStart;
  return new Token(kind, start, end, line, col, value);
}
function readNextToken(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    switch (code) {
      case 65279:
      case 9:
      case 32:
      case 44:
        ++position;
        continue;
      case 10:
        ++position;
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 13:
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 35:
        return readComment(lexer, position);
      case 33:
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 36:
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 38:
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 40:
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      case 41:
        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 46:
        if (body.charCodeAt(position + 1) === 46 && body.charCodeAt(position + 2) === 46) {
          return createToken(lexer, TokenKind.SPREAD, position, position + 3);
        }
        break;
      case 58:
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 61:
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 64:
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 91:
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 93:
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 123:
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 124:
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 125:
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 34:
        if (body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
          return readBlockString(lexer, position);
        }
        return readString(lexer, position);
    }
    if (isDigit2(code) || code === 45) {
      return readNumber(lexer, position, code);
    }
    if (isNameStart(code)) {
      return readName(lexer, position);
    }
    throw syntaxError(lexer.source, position, code === 39 ? `Unexpected single quote character ('), did you mean to use a double quote (")?` : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position) ? `Unexpected character: ${printCodePointAt(lexer, position)}.` : `Invalid character: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}
function readComment(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.COMMENT, start, position, body.slice(start + 1, position));
}
function readNumber(lexer, start, firstCode) {
  const body = lexer.source.body;
  let position = start;
  let code = firstCode;
  let isFloat = false;
  if (code === 45) {
    code = body.charCodeAt(++position);
  }
  if (code === 48) {
    code = body.charCodeAt(++position);
    if (isDigit2(code)) {
      throw syntaxError(lexer.source, position, `Invalid number, unexpected digit after 0: ${printCodePointAt(lexer, position)}.`);
    }
  } else {
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46) {
    isFloat = true;
    code = body.charCodeAt(++position);
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 69 || code === 101) {
    isFloat = true;
    code = body.charCodeAt(++position);
    if (code === 43 || code === 45) {
      code = body.charCodeAt(++position);
    }
    position = readDigits(lexer, position, code);
    code = body.charCodeAt(position);
  }
  if (code === 46 || isNameStart(code)) {
    throw syntaxError(lexer.source, position, `Invalid number, expected digit but got: ${printCodePointAt(lexer, position)}.`);
  }
  return createToken(lexer, isFloat ? TokenKind.FLOAT : TokenKind.INT, start, position, body.slice(start, position));
}
function readDigits(lexer, start, firstCode) {
  if (!isDigit2(firstCode)) {
    throw syntaxError(lexer.source, start, `Invalid number, expected digit but got: ${printCodePointAt(lexer, start)}.`);
  }
  const body = lexer.source.body;
  let position = start + 1;
  while (isDigit2(body.charCodeAt(position))) {
    ++position;
  }
  return position;
}
function readString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  let chunkStart = position;
  let value = "";
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34) {
      value += body.slice(chunkStart, position);
      return createToken(lexer, TokenKind.STRING, start, position + 1, value);
    }
    if (code === 92) {
      value += body.slice(chunkStart, position);
      const escape = body.charCodeAt(position + 1) === 117 ? body.charCodeAt(position + 2) === 123 ? readEscapedUnicodeVariableWidth(lexer, position) : readEscapedUnicodeFixedWidth(lexer, position) : readEscapedCharacter(lexer, position);
      value += escape.value;
      position += escape.size;
      chunkStart = position;
      continue;
    }
    if (code === 10 || code === 13) {
      break;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readEscapedUnicodeVariableWidth(lexer, position) {
  const body = lexer.source.body;
  let point = 0;
  let size = 3;
  while (size < 12) {
    const code = body.charCodeAt(position + size++);
    if (code === 125) {
      if (size < 5 || !isUnicodeScalarValue(point)) {
        break;
      }
      return {
        value: String.fromCodePoint(point),
        size
      };
    }
    point = point << 4 | readHexDigit(code);
    if (point < 0) {
      break;
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + size)}".`);
}
function readEscapedUnicodeFixedWidth(lexer, position) {
  const body = lexer.source.body;
  const code = read16BitHexCode(body, position + 2);
  if (isUnicodeScalarValue(code)) {
    return {
      value: String.fromCodePoint(code),
      size: 6
    };
  }
  if (isLeadingSurrogate(code)) {
    if (body.charCodeAt(position + 6) === 92 && body.charCodeAt(position + 7) === 117) {
      const trailingCode = read16BitHexCode(body, position + 8);
      if (isTrailingSurrogate(trailingCode)) {
        return {
          value: String.fromCodePoint(code, trailingCode),
          size: 12
        };
      }
    }
  }
  throw syntaxError(lexer.source, position, `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`);
}
function read16BitHexCode(body, position) {
  return readHexDigit(body.charCodeAt(position)) << 12 | readHexDigit(body.charCodeAt(position + 1)) << 8 | readHexDigit(body.charCodeAt(position + 2)) << 4 | readHexDigit(body.charCodeAt(position + 3));
}
function readHexDigit(code) {
  return code >= 48 && code <= 57 ? code - 48 : code >= 65 && code <= 70 ? code - 55 : code >= 97 && code <= 102 ? code - 87 : -1;
}
function readEscapedCharacter(lexer, position) {
  const body = lexer.source.body;
  const code = body.charCodeAt(position + 1);
  switch (code) {
    case 34:
      return {
        value: '"',
        size: 2
      };
    case 92:
      return {
        value: "\\",
        size: 2
      };
    case 47:
      return {
        value: "/",
        size: 2
      };
    case 98:
      return {
        value: "\b",
        size: 2
      };
    case 102:
      return {
        value: "\f",
        size: 2
      };
    case 110:
      return {
        value: `
`,
        size: 2
      };
    case 114:
      return {
        value: "\r",
        size: 2
      };
    case 116:
      return {
        value: "\t",
        size: 2
      };
  }
  throw syntaxError(lexer.source, position, `Invalid character escape sequence: "${body.slice(position, position + 2)}".`);
}
function readBlockString(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let lineStart = lexer.lineStart;
  let position = start + 3;
  let chunkStart = position;
  let currentLine = "";
  const blockLines = [];
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (code === 34 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      const token = createToken(lexer, TokenKind.BLOCK_STRING, start, position + 3, dedentBlockStringLines(blockLines).join(`
`));
      lexer.line += blockLines.length - 1;
      lexer.lineStart = lineStart;
      return token;
    }
    if (code === 92 && body.charCodeAt(position + 1) === 34 && body.charCodeAt(position + 2) === 34 && body.charCodeAt(position + 3) === 34) {
      currentLine += body.slice(chunkStart, position);
      chunkStart = position + 1;
      position += 4;
      continue;
    }
    if (code === 10 || code === 13) {
      currentLine += body.slice(chunkStart, position);
      blockLines.push(currentLine);
      if (code === 13 && body.charCodeAt(position + 1) === 10) {
        position += 2;
      } else {
        ++position;
      }
      currentLine = "";
      chunkStart = position;
      lineStart = position;
      continue;
    }
    if (isUnicodeScalarValue(code)) {
      ++position;
    } else if (isSupplementaryCodePoint(body, position)) {
      position += 2;
    } else {
      throw syntaxError(lexer.source, position, `Invalid character within String: ${printCodePointAt(lexer, position)}.`);
    }
  }
  throw syntaxError(lexer.source, position, "Unterminated string.");
}
function readName(lexer, start) {
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;
  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    if (isNameContinue(code)) {
      ++position;
    } else {
      break;
    }
  }
  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}

// node_modules/graphql/language/parser.mjs
function parse(source, options) {
  const parser = new Parser(source, options);
  const document = parser.parseDocument();
  Object.defineProperty(document, "tokenCount", {
    enumerable: false,
    value: parser.tokenCount
  });
  return document;
}
function parseType(source, options) {
  const parser = new Parser(source, options);
  parser.expectToken(TokenKind.SOF);
  const type = parser.parseTypeReference();
  parser.expectToken(TokenKind.EOF);
  return type;
}

class Parser {
  constructor(source, options = {}) {
    const sourceObj = isSource(source) ? source : new Source(source);
    this._lexer = new Lexer(sourceObj);
    this._options = options;
    this._tokenCounter = 0;
  }
  get tokenCount() {
    return this._tokenCounter;
  }
  parseName() {
    const token = this.expectToken(TokenKind.NAME);
    return this.node(token, {
      kind: Kind.NAME,
      value: token.value
    });
  }
  parseDocument() {
    return this.node(this._lexer.token, {
      kind: Kind.DOCUMENT,
      definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF)
    });
  }
  parseDefinition() {
    if (this.peek(TokenKind.BRACE_L)) {
      return this.parseOperationDefinition();
    }
    const hasDescription = this.peekDescription();
    const keywordToken = hasDescription ? this._lexer.lookahead() : this._lexer.token;
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaDefinition();
        case "scalar":
          return this.parseScalarTypeDefinition();
        case "type":
          return this.parseObjectTypeDefinition();
        case "interface":
          return this.parseInterfaceTypeDefinition();
        case "union":
          return this.parseUnionTypeDefinition();
        case "enum":
          return this.parseEnumTypeDefinition();
        case "input":
          return this.parseInputObjectTypeDefinition();
        case "directive":
          return this.parseDirectiveDefinition();
      }
      if (hasDescription) {
        throw syntaxError(this._lexer.source, this._lexer.token.start, "Unexpected description, descriptions are supported only on type definitions.");
      }
      switch (keywordToken.value) {
        case "query":
        case "mutation":
        case "subscription":
          return this.parseOperationDefinition();
        case "fragment":
          return this.parseFragmentDefinition();
        case "extend":
          return this.parseTypeSystemExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseOperationDefinition() {
    const start = this._lexer.token;
    if (this.peek(TokenKind.BRACE_L)) {
      return this.node(start, {
        kind: Kind.OPERATION_DEFINITION,
        operation: OperationTypeNode.QUERY,
        name: undefined,
        variableDefinitions: [],
        directives: [],
        selectionSet: this.parseSelectionSet()
      });
    }
    const operation = this.parseOperationType();
    let name;
    if (this.peek(TokenKind.NAME)) {
      name = this.parseName();
    }
    return this.node(start, {
      kind: Kind.OPERATION_DEFINITION,
      operation,
      name,
      variableDefinitions: this.parseVariableDefinitions(),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseOperationType() {
    const operationToken = this.expectToken(TokenKind.NAME);
    switch (operationToken.value) {
      case "query":
        return OperationTypeNode.QUERY;
      case "mutation":
        return OperationTypeNode.MUTATION;
      case "subscription":
        return OperationTypeNode.SUBSCRIPTION;
    }
    throw this.unexpected(operationToken);
  }
  parseVariableDefinitions() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
  }
  parseVariableDefinition() {
    return this.node(this._lexer.token, {
      kind: Kind.VARIABLE_DEFINITION,
      variable: this.parseVariable(),
      type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
      defaultValue: this.expectOptionalToken(TokenKind.EQUALS) ? this.parseConstValueLiteral() : undefined,
      directives: this.parseConstDirectives()
    });
  }
  parseVariable() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.DOLLAR);
    return this.node(start, {
      kind: Kind.VARIABLE,
      name: this.parseName()
    });
  }
  parseSelectionSet() {
    return this.node(this._lexer.token, {
      kind: Kind.SELECTION_SET,
      selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R)
    });
  }
  parseSelection() {
    return this.peek(TokenKind.SPREAD) ? this.parseFragment() : this.parseField();
  }
  parseField() {
    const start = this._lexer.token;
    const nameOrAlias = this.parseName();
    let alias;
    let name;
    if (this.expectOptionalToken(TokenKind.COLON)) {
      alias = nameOrAlias;
      name = this.parseName();
    } else {
      name = nameOrAlias;
    }
    return this.node(start, {
      kind: Kind.FIELD,
      alias,
      name,
      arguments: this.parseArguments(false),
      directives: this.parseDirectives(false),
      selectionSet: this.peek(TokenKind.BRACE_L) ? this.parseSelectionSet() : undefined
    });
  }
  parseArguments(isConst) {
    const item = isConst ? this.parseConstArgument : this.parseArgument;
    return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
  }
  parseArgument(isConst = false) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.ARGUMENT,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseConstArgument() {
    return this.parseArgument(true);
  }
  parseFragment() {
    const start = this._lexer.token;
    this.expectToken(TokenKind.SPREAD);
    const hasTypeCondition = this.expectOptionalKeyword("on");
    if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
      return this.node(start, {
        kind: Kind.FRAGMENT_SPREAD,
        name: this.parseFragmentName(),
        directives: this.parseDirectives(false)
      });
    }
    return this.node(start, {
      kind: Kind.INLINE_FRAGMENT,
      typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentDefinition() {
    const start = this._lexer.token;
    this.expectKeyword("fragment");
    if (this._options.allowLegacyFragmentVariables === true) {
      return this.node(start, {
        kind: Kind.FRAGMENT_DEFINITION,
        name: this.parseFragmentName(),
        variableDefinitions: this.parseVariableDefinitions(),
        typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
        directives: this.parseDirectives(false),
        selectionSet: this.parseSelectionSet()
      });
    }
    return this.node(start, {
      kind: Kind.FRAGMENT_DEFINITION,
      name: this.parseFragmentName(),
      typeCondition: (this.expectKeyword("on"), this.parseNamedType()),
      directives: this.parseDirectives(false),
      selectionSet: this.parseSelectionSet()
    });
  }
  parseFragmentName() {
    if (this._lexer.token.value === "on") {
      throw this.unexpected();
    }
    return this.parseName();
  }
  parseValueLiteral(isConst) {
    const token = this._lexer.token;
    switch (token.kind) {
      case TokenKind.BRACKET_L:
        return this.parseList(isConst);
      case TokenKind.BRACE_L:
        return this.parseObject(isConst);
      case TokenKind.INT:
        this.advanceLexer();
        return this.node(token, {
          kind: Kind.INT,
          value: token.value
        });
      case TokenKind.FLOAT:
        this.advanceLexer();
        return this.node(token, {
          kind: Kind.FLOAT,
          value: token.value
        });
      case TokenKind.STRING:
      case TokenKind.BLOCK_STRING:
        return this.parseStringLiteral();
      case TokenKind.NAME:
        this.advanceLexer();
        switch (token.value) {
          case "true":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: true
            });
          case "false":
            return this.node(token, {
              kind: Kind.BOOLEAN,
              value: false
            });
          case "null":
            return this.node(token, {
              kind: Kind.NULL
            });
          default:
            return this.node(token, {
              kind: Kind.ENUM,
              value: token.value
            });
        }
      case TokenKind.DOLLAR:
        if (isConst) {
          this.expectToken(TokenKind.DOLLAR);
          if (this._lexer.token.kind === TokenKind.NAME) {
            const varName = this._lexer.token.value;
            throw syntaxError(this._lexer.source, token.start, `Unexpected variable "$${varName}" in constant value.`);
          } else {
            throw this.unexpected(token);
          }
        }
        return this.parseVariable();
      default:
        throw this.unexpected();
    }
  }
  parseConstValueLiteral() {
    return this.parseValueLiteral(true);
  }
  parseStringLiteral() {
    const token = this._lexer.token;
    this.advanceLexer();
    return this.node(token, {
      kind: Kind.STRING,
      value: token.value,
      block: token.kind === TokenKind.BLOCK_STRING
    });
  }
  parseList(isConst) {
    const item = () => this.parseValueLiteral(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.LIST,
      values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R)
    });
  }
  parseObject(isConst) {
    const item = () => this.parseObjectField(isConst);
    return this.node(this._lexer.token, {
      kind: Kind.OBJECT,
      fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R)
    });
  }
  parseObjectField(isConst) {
    const start = this._lexer.token;
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    return this.node(start, {
      kind: Kind.OBJECT_FIELD,
      name,
      value: this.parseValueLiteral(isConst)
    });
  }
  parseDirectives(isConst) {
    const directives = [];
    while (this.peek(TokenKind.AT)) {
      directives.push(this.parseDirective(isConst));
    }
    return directives;
  }
  parseConstDirectives() {
    return this.parseDirectives(true);
  }
  parseDirective(isConst) {
    const start = this._lexer.token;
    this.expectToken(TokenKind.AT);
    return this.node(start, {
      kind: Kind.DIRECTIVE,
      name: this.parseName(),
      arguments: this.parseArguments(isConst)
    });
  }
  parseTypeReference() {
    const start = this._lexer.token;
    let type;
    if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
      const innerType = this.parseTypeReference();
      this.expectToken(TokenKind.BRACKET_R);
      type = this.node(start, {
        kind: Kind.LIST_TYPE,
        type: innerType
      });
    } else {
      type = this.parseNamedType();
    }
    if (this.expectOptionalToken(TokenKind.BANG)) {
      return this.node(start, {
        kind: Kind.NON_NULL_TYPE,
        type
      });
    }
    return type;
  }
  parseNamedType() {
    return this.node(this._lexer.token, {
      kind: Kind.NAMED_TYPE,
      name: this.parseName()
    });
  }
  peekDescription() {
    return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
  }
  parseDescription() {
    if (this.peekDescription()) {
      return this.parseStringLiteral();
    }
  }
  parseSchemaDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    return this.node(start, {
      kind: Kind.SCHEMA_DEFINITION,
      description,
      directives,
      operationTypes
    });
  }
  parseOperationTypeDefinition() {
    const start = this._lexer.token;
    const operation = this.parseOperationType();
    this.expectToken(TokenKind.COLON);
    const type = this.parseNamedType();
    return this.node(start, {
      kind: Kind.OPERATION_TYPE_DEFINITION,
      operation,
      type
    });
  }
  parseScalarTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseImplementsInterfaces() {
    return this.expectOptionalKeyword("implements") ? this.delimitedMany(TokenKind.AMP, this.parseNamedType) : [];
  }
  parseFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
  }
  parseFieldDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.FIELD_DEFINITION,
      description,
      name,
      arguments: args,
      type,
      directives
    });
  }
  parseArgumentDefs() {
    return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
  }
  parseInputValueDef() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseName();
    this.expectToken(TokenKind.COLON);
    const type = this.parseTypeReference();
    let defaultValue;
    if (this.expectOptionalToken(TokenKind.EQUALS)) {
      defaultValue = this.parseConstValueLiteral();
    }
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.INPUT_VALUE_DEFINITION,
      description,
      name,
      type,
      defaultValue,
      directives
    });
  }
  parseInterfaceTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_DEFINITION,
      description,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    return this.node(start, {
      kind: Kind.UNION_TYPE_DEFINITION,
      description,
      name,
      directives,
      types
    });
  }
  parseUnionMemberTypes() {
    return this.expectOptionalToken(TokenKind.EQUALS) ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType) : [];
  }
  parseEnumTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    return this.node(start, {
      kind: Kind.ENUM_TYPE_DEFINITION,
      description,
      name,
      directives,
      values
    });
  }
  parseEnumValuesDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
  }
  parseEnumValueDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    const name = this.parseEnumValueName();
    const directives = this.parseConstDirectives();
    return this.node(start, {
      kind: Kind.ENUM_VALUE_DEFINITION,
      description,
      name,
      directives
    });
  }
  parseEnumValueName() {
    if (this._lexer.token.value === "true" || this._lexer.token.value === "false" || this._lexer.token.value === "null") {
      throw syntaxError(this._lexer.source, this._lexer.token.start, `${getTokenDesc(this._lexer.token)} is reserved and cannot be used for an enum value.`);
    }
    return this.parseName();
  }
  parseInputObjectTypeDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      description,
      name,
      directives,
      fields
    });
  }
  parseInputFieldsDefinition() {
    return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
  }
  parseTypeSystemExtension() {
    const keywordToken = this._lexer.lookahead();
    if (keywordToken.kind === TokenKind.NAME) {
      switch (keywordToken.value) {
        case "schema":
          return this.parseSchemaExtension();
        case "scalar":
          return this.parseScalarTypeExtension();
        case "type":
          return this.parseObjectTypeExtension();
        case "interface":
          return this.parseInterfaceTypeExtension();
        case "union":
          return this.parseUnionTypeExtension();
        case "enum":
          return this.parseEnumTypeExtension();
        case "input":
          return this.parseInputObjectTypeExtension();
      }
    }
    throw this.unexpected(keywordToken);
  }
  parseSchemaExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("schema");
    const directives = this.parseConstDirectives();
    const operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
    if (directives.length === 0 && operationTypes.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCHEMA_EXTENSION,
      directives,
      operationTypes
    });
  }
  parseScalarTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("scalar");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    if (directives.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.SCALAR_TYPE_EXTENSION,
      name,
      directives
    });
  }
  parseObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("type");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.OBJECT_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseInterfaceTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("interface");
    const name = this.parseName();
    const interfaces = this.parseImplementsInterfaces();
    const directives = this.parseConstDirectives();
    const fields = this.parseFieldsDefinition();
    if (interfaces.length === 0 && directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INTERFACE_TYPE_EXTENSION,
      name,
      interfaces,
      directives,
      fields
    });
  }
  parseUnionTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("union");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const types = this.parseUnionMemberTypes();
    if (directives.length === 0 && types.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.UNION_TYPE_EXTENSION,
      name,
      directives,
      types
    });
  }
  parseEnumTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("enum");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const values = this.parseEnumValuesDefinition();
    if (directives.length === 0 && values.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.ENUM_TYPE_EXTENSION,
      name,
      directives,
      values
    });
  }
  parseInputObjectTypeExtension() {
    const start = this._lexer.token;
    this.expectKeyword("extend");
    this.expectKeyword("input");
    const name = this.parseName();
    const directives = this.parseConstDirectives();
    const fields = this.parseInputFieldsDefinition();
    if (directives.length === 0 && fields.length === 0) {
      throw this.unexpected();
    }
    return this.node(start, {
      kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
      name,
      directives,
      fields
    });
  }
  parseDirectiveDefinition() {
    const start = this._lexer.token;
    const description = this.parseDescription();
    this.expectKeyword("directive");
    this.expectToken(TokenKind.AT);
    const name = this.parseName();
    const args = this.parseArgumentDefs();
    const repeatable = this.expectOptionalKeyword("repeatable");
    this.expectKeyword("on");
    const locations = this.parseDirectiveLocations();
    return this.node(start, {
      kind: Kind.DIRECTIVE_DEFINITION,
      description,
      name,
      arguments: args,
      repeatable,
      locations
    });
  }
  parseDirectiveLocations() {
    return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
  }
  parseDirectiveLocation() {
    const start = this._lexer.token;
    const name = this.parseName();
    if (Object.prototype.hasOwnProperty.call(DirectiveLocation, name.value)) {
      return name;
    }
    throw this.unexpected(start);
  }
  node(startToken, node) {
    if (this._options.noLocation !== true) {
      node.loc = new Location(startToken, this._lexer.lastToken, this._lexer.source);
    }
    return node;
  }
  peek(kind) {
    return this._lexer.token.kind === kind;
  }
  expectToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return token;
    }
    throw syntaxError(this._lexer.source, token.start, `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`);
  }
  expectOptionalToken(kind) {
    const token = this._lexer.token;
    if (token.kind === kind) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  expectKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
    } else {
      throw syntaxError(this._lexer.source, token.start, `Expected "${value}", found ${getTokenDesc(token)}.`);
    }
  }
  expectOptionalKeyword(value) {
    const token = this._lexer.token;
    if (token.kind === TokenKind.NAME && token.value === value) {
      this.advanceLexer();
      return true;
    }
    return false;
  }
  unexpected(atToken) {
    const token = atToken !== null && atToken !== undefined ? atToken : this._lexer.token;
    return syntaxError(this._lexer.source, token.start, `Unexpected ${getTokenDesc(token)}.`);
  }
  any(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    while (!this.expectOptionalToken(closeKind)) {
      nodes.push(parseFn.call(this));
    }
    return nodes;
  }
  optionalMany(openKind, parseFn, closeKind) {
    if (this.expectOptionalToken(openKind)) {
      const nodes = [];
      do {
        nodes.push(parseFn.call(this));
      } while (!this.expectOptionalToken(closeKind));
      return nodes;
    }
    return [];
  }
  many(openKind, parseFn, closeKind) {
    this.expectToken(openKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (!this.expectOptionalToken(closeKind));
    return nodes;
  }
  delimitedMany(delimiterKind, parseFn) {
    this.expectOptionalToken(delimiterKind);
    const nodes = [];
    do {
      nodes.push(parseFn.call(this));
    } while (this.expectOptionalToken(delimiterKind));
    return nodes;
  }
  advanceLexer() {
    const { maxTokens } = this._options;
    const token = this._lexer.advance();
    if (token.kind !== TokenKind.EOF) {
      ++this._tokenCounter;
      if (maxTokens !== undefined && this._tokenCounter > maxTokens) {
        throw syntaxError(this._lexer.source, token.start, `Document contains more that ${maxTokens} tokens. Parsing aborted.`);
      }
    }
  }
}
function getTokenDesc(token) {
  const value = token.value;
  return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : "");
}
function getTokenKindDesc(kind) {
  return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}
// node_modules/graphql/language/predicates.mjs
function isExecutableDefinitionNode(node) {
  return node.kind === Kind.OPERATION_DEFINITION || node.kind === Kind.FRAGMENT_DEFINITION;
}
function isTypeSystemDefinitionNode(node) {
  return node.kind === Kind.SCHEMA_DEFINITION || isTypeDefinitionNode(node) || node.kind === Kind.DIRECTIVE_DEFINITION;
}
function isTypeDefinitionNode(node) {
  return node.kind === Kind.SCALAR_TYPE_DEFINITION || node.kind === Kind.OBJECT_TYPE_DEFINITION || node.kind === Kind.INTERFACE_TYPE_DEFINITION || node.kind === Kind.UNION_TYPE_DEFINITION || node.kind === Kind.ENUM_TYPE_DEFINITION || node.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION;
}
function isTypeSystemExtensionNode(node) {
  return node.kind === Kind.SCHEMA_EXTENSION || isTypeExtensionNode(node);
}
function isTypeExtensionNode(node) {
  return node.kind === Kind.SCALAR_TYPE_EXTENSION || node.kind === Kind.OBJECT_TYPE_EXTENSION || node.kind === Kind.INTERFACE_TYPE_EXTENSION || node.kind === Kind.UNION_TYPE_EXTENSION || node.kind === Kind.ENUM_TYPE_EXTENSION || node.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION;
}
// node_modules/graphql/utilities/typeFromAST.mjs
function typeFromAST(schema, typeNode) {
  switch (typeNode.kind) {
    case Kind.LIST_TYPE: {
      const innerType = typeFromAST(schema, typeNode.type);
      return innerType && new GraphQLList(innerType);
    }
    case Kind.NON_NULL_TYPE: {
      const innerType = typeFromAST(schema, typeNode.type);
      return innerType && new GraphQLNonNull(innerType);
    }
    case Kind.NAMED_TYPE:
      return schema.getType(typeNode.name.value);
  }
}

// node_modules/graphql/utilities/TypeInfo.mjs
class TypeInfo {
  constructor(schema, initialType, getFieldDefFn) {
    this._schema = schema;
    this._typeStack = [];
    this._parentTypeStack = [];
    this._inputTypeStack = [];
    this._fieldDefStack = [];
    this._defaultValueStack = [];
    this._directive = null;
    this._argument = null;
    this._enumValue = null;
    this._getFieldDef = getFieldDefFn !== null && getFieldDefFn !== undefined ? getFieldDefFn : getFieldDef;
    if (initialType) {
      if (isInputType(initialType)) {
        this._inputTypeStack.push(initialType);
      }
      if (isCompositeType(initialType)) {
        this._parentTypeStack.push(initialType);
      }
      if (isOutputType(initialType)) {
        this._typeStack.push(initialType);
      }
    }
  }
  get [Symbol.toStringTag]() {
    return "TypeInfo";
  }
  getType() {
    if (this._typeStack.length > 0) {
      return this._typeStack[this._typeStack.length - 1];
    }
  }
  getParentType() {
    if (this._parentTypeStack.length > 0) {
      return this._parentTypeStack[this._parentTypeStack.length - 1];
    }
  }
  getInputType() {
    if (this._inputTypeStack.length > 0) {
      return this._inputTypeStack[this._inputTypeStack.length - 1];
    }
  }
  getParentInputType() {
    if (this._inputTypeStack.length > 1) {
      return this._inputTypeStack[this._inputTypeStack.length - 2];
    }
  }
  getFieldDef() {
    if (this._fieldDefStack.length > 0) {
      return this._fieldDefStack[this._fieldDefStack.length - 1];
    }
  }
  getDefaultValue() {
    if (this._defaultValueStack.length > 0) {
      return this._defaultValueStack[this._defaultValueStack.length - 1];
    }
  }
  getDirective() {
    return this._directive;
  }
  getArgument() {
    return this._argument;
  }
  getEnumValue() {
    return this._enumValue;
  }
  enter(node) {
    const schema = this._schema;
    switch (node.kind) {
      case Kind.SELECTION_SET: {
        const namedType = getNamedType(this.getType());
        this._parentTypeStack.push(isCompositeType(namedType) ? namedType : undefined);
        break;
      }
      case Kind.FIELD: {
        const parentType = this.getParentType();
        let fieldDef;
        let fieldType;
        if (parentType) {
          fieldDef = this._getFieldDef(schema, parentType, node);
          if (fieldDef) {
            fieldType = fieldDef.type;
          }
        }
        this._fieldDefStack.push(fieldDef);
        this._typeStack.push(isOutputType(fieldType) ? fieldType : undefined);
        break;
      }
      case Kind.DIRECTIVE:
        this._directive = schema.getDirective(node.name.value);
        break;
      case Kind.OPERATION_DEFINITION: {
        const rootType = schema.getRootType(node.operation);
        this._typeStack.push(isObjectType(rootType) ? rootType : undefined);
        break;
      }
      case Kind.INLINE_FRAGMENT:
      case Kind.FRAGMENT_DEFINITION: {
        const typeConditionAST = node.typeCondition;
        const outputType = typeConditionAST ? typeFromAST(schema, typeConditionAST) : getNamedType(this.getType());
        this._typeStack.push(isOutputType(outputType) ? outputType : undefined);
        break;
      }
      case Kind.VARIABLE_DEFINITION: {
        const inputType = typeFromAST(schema, node.type);
        this._inputTypeStack.push(isInputType(inputType) ? inputType : undefined);
        break;
      }
      case Kind.ARGUMENT: {
        var _this$getDirective;
        let argDef;
        let argType;
        const fieldOrDirective = (_this$getDirective = this.getDirective()) !== null && _this$getDirective !== undefined ? _this$getDirective : this.getFieldDef();
        if (fieldOrDirective) {
          argDef = fieldOrDirective.args.find((arg) => arg.name === node.name.value);
          if (argDef) {
            argType = argDef.type;
          }
        }
        this._argument = argDef;
        this._defaultValueStack.push(argDef ? argDef.defaultValue : undefined);
        this._inputTypeStack.push(isInputType(argType) ? argType : undefined);
        break;
      }
      case Kind.LIST: {
        const listType = getNullableType(this.getInputType());
        const itemType = isListType(listType) ? listType.ofType : listType;
        this._defaultValueStack.push(undefined);
        this._inputTypeStack.push(isInputType(itemType) ? itemType : undefined);
        break;
      }
      case Kind.OBJECT_FIELD: {
        const objectType = getNamedType(this.getInputType());
        let inputFieldType;
        let inputField;
        if (isInputObjectType(objectType)) {
          inputField = objectType.getFields()[node.name.value];
          if (inputField) {
            inputFieldType = inputField.type;
          }
        }
        this._defaultValueStack.push(inputField ? inputField.defaultValue : undefined);
        this._inputTypeStack.push(isInputType(inputFieldType) ? inputFieldType : undefined);
        break;
      }
      case Kind.ENUM: {
        const enumType = getNamedType(this.getInputType());
        let enumValue;
        if (isEnumType(enumType)) {
          enumValue = enumType.getValue(node.value);
        }
        this._enumValue = enumValue;
        break;
      }
      default:
    }
  }
  leave(node) {
    switch (node.kind) {
      case Kind.SELECTION_SET:
        this._parentTypeStack.pop();
        break;
      case Kind.FIELD:
        this._fieldDefStack.pop();
        this._typeStack.pop();
        break;
      case Kind.DIRECTIVE:
        this._directive = null;
        break;
      case Kind.OPERATION_DEFINITION:
      case Kind.INLINE_FRAGMENT:
      case Kind.FRAGMENT_DEFINITION:
        this._typeStack.pop();
        break;
      case Kind.VARIABLE_DEFINITION:
        this._inputTypeStack.pop();
        break;
      case Kind.ARGUMENT:
        this._argument = null;
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case Kind.LIST:
      case Kind.OBJECT_FIELD:
        this._defaultValueStack.pop();
        this._inputTypeStack.pop();
        break;
      case Kind.ENUM:
        this._enumValue = null;
        break;
      default:
    }
  }
}
function getFieldDef(schema, parentType, fieldNode) {
  const name = fieldNode.name.value;
  if (name === SchemaMetaFieldDef.name && schema.getQueryType() === parentType) {
    return SchemaMetaFieldDef;
  }
  if (name === TypeMetaFieldDef.name && schema.getQueryType() === parentType) {
    return TypeMetaFieldDef;
  }
  if (name === TypeNameMetaFieldDef.name && isCompositeType(parentType)) {
    return TypeNameMetaFieldDef;
  }
  if (isObjectType(parentType) || isInterfaceType(parentType)) {
    return parentType.getFields()[name];
  }
}
function visitWithTypeInfo(typeInfo, visitor) {
  return {
    enter(...args) {
      const node = args[0];
      typeInfo.enter(node);
      const fn = getEnterLeaveForKind(visitor, node.kind).enter;
      if (fn) {
        const result = fn.apply(visitor, args);
        if (result !== undefined) {
          typeInfo.leave(node);
          if (isNode(result)) {
            typeInfo.enter(result);
          }
        }
        return result;
      }
    },
    leave(...args) {
      const node = args[0];
      const fn = getEnterLeaveForKind(visitor, node.kind).leave;
      let result;
      if (fn) {
        result = fn.apply(visitor, args);
      }
      typeInfo.leave(node);
      return result;
    }
  };
}

// node_modules/graphql/validation/rules/ExecutableDefinitionsRule.mjs
function ExecutableDefinitionsRule(context) {
  return {
    Document(node) {
      for (const definition of node.definitions) {
        if (!isExecutableDefinitionNode(definition)) {
          const defName = definition.kind === Kind.SCHEMA_DEFINITION || definition.kind === Kind.SCHEMA_EXTENSION ? "schema" : '"' + definition.name.value + '"';
          context.reportError(new GraphQLError(`The ${defName} definition is not executable.`, {
            nodes: definition
          }));
        }
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/FieldsOnCorrectTypeRule.mjs
function FieldsOnCorrectTypeRule(context) {
  return {
    Field(node) {
      const type = context.getParentType();
      if (type) {
        const fieldDef = context.getFieldDef();
        if (!fieldDef) {
          const schema = context.getSchema();
          const fieldName = node.name.value;
          let suggestion = didYouMean("to use an inline fragment on", getSuggestedTypeNames(schema, type, fieldName));
          if (suggestion === "") {
            suggestion = didYouMean(getSuggestedFieldNames(type, fieldName));
          }
          context.reportError(new GraphQLError(`Cannot query field "${fieldName}" on type "${type.name}".` + suggestion, {
            nodes: node
          }));
        }
      }
    }
  };
}
function getSuggestedTypeNames(schema, type, fieldName) {
  if (!isAbstractType(type)) {
    return [];
  }
  const suggestedTypes = new Set;
  const usageCount = Object.create(null);
  for (const possibleType of schema.getPossibleTypes(type)) {
    if (!possibleType.getFields()[fieldName]) {
      continue;
    }
    suggestedTypes.add(possibleType);
    usageCount[possibleType.name] = 1;
    for (const possibleInterface of possibleType.getInterfaces()) {
      var _usageCount$possibleI;
      if (!possibleInterface.getFields()[fieldName]) {
        continue;
      }
      suggestedTypes.add(possibleInterface);
      usageCount[possibleInterface.name] = ((_usageCount$possibleI = usageCount[possibleInterface.name]) !== null && _usageCount$possibleI !== undefined ? _usageCount$possibleI : 0) + 1;
    }
  }
  return [...suggestedTypes].sort((typeA, typeB) => {
    const usageCountDiff = usageCount[typeB.name] - usageCount[typeA.name];
    if (usageCountDiff !== 0) {
      return usageCountDiff;
    }
    if (isInterfaceType(typeA) && schema.isSubType(typeA, typeB)) {
      return -1;
    }
    if (isInterfaceType(typeB) && schema.isSubType(typeB, typeA)) {
      return 1;
    }
    return naturalCompare(typeA.name, typeB.name);
  }).map((x) => x.name);
}
function getSuggestedFieldNames(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type)) {
    const possibleFieldNames = Object.keys(type.getFields());
    return suggestionList(fieldName, possibleFieldNames);
  }
  return [];
}

// node_modules/graphql/validation/rules/FragmentsOnCompositeTypesRule.mjs
function FragmentsOnCompositeTypesRule(context) {
  return {
    InlineFragment(node) {
      const typeCondition = node.typeCondition;
      if (typeCondition) {
        const type = typeFromAST(context.getSchema(), typeCondition);
        if (type && !isCompositeType(type)) {
          const typeStr = print(typeCondition);
          context.reportError(new GraphQLError(`Fragment cannot condition on non composite type "${typeStr}".`, {
            nodes: typeCondition
          }));
        }
      }
    },
    FragmentDefinition(node) {
      const type = typeFromAST(context.getSchema(), node.typeCondition);
      if (type && !isCompositeType(type)) {
        const typeStr = print(node.typeCondition);
        context.reportError(new GraphQLError(`Fragment "${node.name.value}" cannot condition on non composite type "${typeStr}".`, {
          nodes: node.typeCondition
        }));
      }
    }
  };
}

// node_modules/graphql/validation/rules/KnownArgumentNamesRule.mjs
function KnownArgumentNamesRule(context) {
  return {
    ...KnownArgumentNamesOnDirectivesRule(context),
    Argument(argNode) {
      const argDef = context.getArgument();
      const fieldDef = context.getFieldDef();
      const parentType = context.getParentType();
      if (!argDef && fieldDef && parentType) {
        const argName = argNode.name.value;
        const knownArgsNames = fieldDef.args.map((arg) => arg.name);
        const suggestions = suggestionList(argName, knownArgsNames);
        context.reportError(new GraphQLError(`Unknown argument "${argName}" on field "${parentType.name}.${fieldDef.name}".` + didYouMean(suggestions), {
          nodes: argNode
        }));
      }
    }
  };
}
function KnownArgumentNamesOnDirectivesRule(context) {
  const directiveArgs = Object.create(null);
  const schema = context.getSchema();
  const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    directiveArgs[directive.name] = directive.args.map((arg) => arg.name);
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      var _def$arguments;
      const argsNodes = (_def$arguments = def.arguments) !== null && _def$arguments !== undefined ? _def$arguments : [];
      directiveArgs[def.name.value] = argsNodes.map((arg) => arg.name.value);
    }
  }
  return {
    Directive(directiveNode) {
      const directiveName = directiveNode.name.value;
      const knownArgs = directiveArgs[directiveName];
      if (directiveNode.arguments && knownArgs) {
        for (const argNode of directiveNode.arguments) {
          const argName = argNode.name.value;
          if (!knownArgs.includes(argName)) {
            const suggestions = suggestionList(argName, knownArgs);
            context.reportError(new GraphQLError(`Unknown argument "${argName}" on directive "@${directiveName}".` + didYouMean(suggestions), {
              nodes: argNode
            }));
          }
        }
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/KnownDirectivesRule.mjs
function KnownDirectivesRule(context) {
  const locationsMap = Object.create(null);
  const schema = context.getSchema();
  const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    locationsMap[directive.name] = directive.locations;
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      locationsMap[def.name.value] = def.locations.map((name) => name.value);
    }
  }
  return {
    Directive(node, _key, _parent, _path, ancestors) {
      const name = node.name.value;
      const locations = locationsMap[name];
      if (!locations) {
        context.reportError(new GraphQLError(`Unknown directive "@${name}".`, {
          nodes: node
        }));
        return;
      }
      const candidateLocation = getDirectiveLocationForASTPath(ancestors);
      if (candidateLocation && !locations.includes(candidateLocation)) {
        context.reportError(new GraphQLError(`Directive "@${name}" may not be used on ${candidateLocation}.`, {
          nodes: node
        }));
      }
    }
  };
}
function getDirectiveLocationForASTPath(ancestors) {
  const appliedTo = ancestors[ancestors.length - 1];
  "kind" in appliedTo || invariant(false);
  switch (appliedTo.kind) {
    case Kind.OPERATION_DEFINITION:
      return getDirectiveLocationForOperation(appliedTo.operation);
    case Kind.FIELD:
      return DirectiveLocation.FIELD;
    case Kind.FRAGMENT_SPREAD:
      return DirectiveLocation.FRAGMENT_SPREAD;
    case Kind.INLINE_FRAGMENT:
      return DirectiveLocation.INLINE_FRAGMENT;
    case Kind.FRAGMENT_DEFINITION:
      return DirectiveLocation.FRAGMENT_DEFINITION;
    case Kind.VARIABLE_DEFINITION:
      return DirectiveLocation.VARIABLE_DEFINITION;
    case Kind.SCHEMA_DEFINITION:
    case Kind.SCHEMA_EXTENSION:
      return DirectiveLocation.SCHEMA;
    case Kind.SCALAR_TYPE_DEFINITION:
    case Kind.SCALAR_TYPE_EXTENSION:
      return DirectiveLocation.SCALAR;
    case Kind.OBJECT_TYPE_DEFINITION:
    case Kind.OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.OBJECT;
    case Kind.FIELD_DEFINITION:
      return DirectiveLocation.FIELD_DEFINITION;
    case Kind.INTERFACE_TYPE_DEFINITION:
    case Kind.INTERFACE_TYPE_EXTENSION:
      return DirectiveLocation.INTERFACE;
    case Kind.UNION_TYPE_DEFINITION:
    case Kind.UNION_TYPE_EXTENSION:
      return DirectiveLocation.UNION;
    case Kind.ENUM_TYPE_DEFINITION:
    case Kind.ENUM_TYPE_EXTENSION:
      return DirectiveLocation.ENUM;
    case Kind.ENUM_VALUE_DEFINITION:
      return DirectiveLocation.ENUM_VALUE;
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
    case Kind.INPUT_OBJECT_TYPE_EXTENSION:
      return DirectiveLocation.INPUT_OBJECT;
    case Kind.INPUT_VALUE_DEFINITION: {
      const parentNode = ancestors[ancestors.length - 3];
      "kind" in parentNode || invariant(false);
      return parentNode.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ? DirectiveLocation.INPUT_FIELD_DEFINITION : DirectiveLocation.ARGUMENT_DEFINITION;
    }
    default:
      invariant(false, "Unexpected kind: " + inspect(appliedTo.kind));
  }
}
function getDirectiveLocationForOperation(operation) {
  switch (operation) {
    case OperationTypeNode.QUERY:
      return DirectiveLocation.QUERY;
    case OperationTypeNode.MUTATION:
      return DirectiveLocation.MUTATION;
    case OperationTypeNode.SUBSCRIPTION:
      return DirectiveLocation.SUBSCRIPTION;
  }
}

// node_modules/graphql/validation/rules/KnownFragmentNamesRule.mjs
function KnownFragmentNamesRule(context) {
  return {
    FragmentSpread(node) {
      const fragmentName = node.name.value;
      const fragment = context.getFragment(fragmentName);
      if (!fragment) {
        context.reportError(new GraphQLError(`Unknown fragment "${fragmentName}".`, {
          nodes: node.name
        }));
      }
    }
  };
}

// node_modules/graphql/validation/rules/KnownTypeNamesRule.mjs
function KnownTypeNamesRule(context) {
  const schema = context.getSchema();
  const existingTypesMap = schema ? schema.getTypeMap() : Object.create(null);
  const definedTypes = Object.create(null);
  for (const def of context.getDocument().definitions) {
    if (isTypeDefinitionNode(def)) {
      definedTypes[def.name.value] = true;
    }
  }
  const typeNames = [
    ...Object.keys(existingTypesMap),
    ...Object.keys(definedTypes)
  ];
  return {
    NamedType(node, _1, parent, _2, ancestors) {
      const typeName = node.name.value;
      if (!existingTypesMap[typeName] && !definedTypes[typeName]) {
        var _ancestors$;
        const definitionNode = (_ancestors$ = ancestors[2]) !== null && _ancestors$ !== undefined ? _ancestors$ : parent;
        const isSDL = definitionNode != null && isSDLNode(definitionNode);
        if (isSDL && standardTypeNames.includes(typeName)) {
          return;
        }
        const suggestedTypes = suggestionList(typeName, isSDL ? standardTypeNames.concat(typeNames) : typeNames);
        context.reportError(new GraphQLError(`Unknown type "${typeName}".` + didYouMean(suggestedTypes), {
          nodes: node
        }));
      }
    }
  };
}
var standardTypeNames = [...specifiedScalarTypes, ...introspectionTypes].map((type) => type.name);
function isSDLNode(value) {
  return "kind" in value && (isTypeSystemDefinitionNode(value) || isTypeSystemExtensionNode(value));
}

// node_modules/graphql/validation/rules/LoneAnonymousOperationRule.mjs
function LoneAnonymousOperationRule(context) {
  let operationCount = 0;
  return {
    Document(node) {
      operationCount = node.definitions.filter((definition) => definition.kind === Kind.OPERATION_DEFINITION).length;
    },
    OperationDefinition(node) {
      if (!node.name && operationCount > 1) {
        context.reportError(new GraphQLError("This anonymous operation must be the only defined operation.", {
          nodes: node
        }));
      }
    }
  };
}

// node_modules/graphql/validation/rules/LoneSchemaDefinitionRule.mjs
function LoneSchemaDefinitionRule(context) {
  var _ref, _ref2, _oldSchema$astNode;
  const oldSchema = context.getSchema();
  const alreadyDefined = (_ref = (_ref2 = (_oldSchema$astNode = oldSchema === null || oldSchema === undefined ? undefined : oldSchema.astNode) !== null && _oldSchema$astNode !== undefined ? _oldSchema$astNode : oldSchema === null || oldSchema === undefined ? undefined : oldSchema.getQueryType()) !== null && _ref2 !== undefined ? _ref2 : oldSchema === null || oldSchema === undefined ? undefined : oldSchema.getMutationType()) !== null && _ref !== undefined ? _ref : oldSchema === null || oldSchema === undefined ? undefined : oldSchema.getSubscriptionType();
  let schemaDefinitionsCount = 0;
  return {
    SchemaDefinition(node) {
      if (alreadyDefined) {
        context.reportError(new GraphQLError("Cannot define a new schema within a schema extension.", {
          nodes: node
        }));
        return;
      }
      if (schemaDefinitionsCount > 0) {
        context.reportError(new GraphQLError("Must provide only one schema definition.", {
          nodes: node
        }));
      }
      ++schemaDefinitionsCount;
    }
  };
}

// node_modules/graphql/validation/rules/MaxIntrospectionDepthRule.mjs
var MAX_LISTS_DEPTH = 3;
function MaxIntrospectionDepthRule(context) {
  function checkDepth(node, visitedFragments = Object.create(null), depth = 0) {
    if (node.kind === Kind.FRAGMENT_SPREAD) {
      const fragmentName = node.name.value;
      if (visitedFragments[fragmentName] === true) {
        return false;
      }
      const fragment = context.getFragment(fragmentName);
      if (!fragment) {
        return false;
      }
      try {
        visitedFragments[fragmentName] = true;
        return checkDepth(fragment, visitedFragments, depth);
      } finally {
        visitedFragments[fragmentName] = undefined;
      }
    }
    if (node.kind === Kind.FIELD && (node.name.value === "fields" || node.name.value === "interfaces" || node.name.value === "possibleTypes" || node.name.value === "inputFields")) {
      depth++;
      if (depth >= MAX_LISTS_DEPTH) {
        return true;
      }
    }
    if ("selectionSet" in node && node.selectionSet) {
      for (const child of node.selectionSet.selections) {
        if (checkDepth(child, visitedFragments, depth)) {
          return true;
        }
      }
    }
    return false;
  }
  return {
    Field(node) {
      if (node.name.value === "__schema" || node.name.value === "__type") {
        if (checkDepth(node)) {
          context.reportError(new GraphQLError("Maximum introspection depth exceeded", {
            nodes: [node]
          }));
          return false;
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/NoFragmentCyclesRule.mjs
function NoFragmentCyclesRule(context) {
  const visitedFrags = Object.create(null);
  const spreadPath = [];
  const spreadPathIndexByName = Object.create(null);
  return {
    OperationDefinition: () => false,
    FragmentDefinition(node) {
      detectCycleRecursive(node);
      return false;
    }
  };
  function detectCycleRecursive(fragment) {
    if (visitedFrags[fragment.name.value]) {
      return;
    }
    const fragmentName = fragment.name.value;
    visitedFrags[fragmentName] = true;
    const spreadNodes = context.getFragmentSpreads(fragment.selectionSet);
    if (spreadNodes.length === 0) {
      return;
    }
    spreadPathIndexByName[fragmentName] = spreadPath.length;
    for (const spreadNode of spreadNodes) {
      const spreadName = spreadNode.name.value;
      const cycleIndex = spreadPathIndexByName[spreadName];
      spreadPath.push(spreadNode);
      if (cycleIndex === undefined) {
        const spreadFragment = context.getFragment(spreadName);
        if (spreadFragment) {
          detectCycleRecursive(spreadFragment);
        }
      } else {
        const cyclePath = spreadPath.slice(cycleIndex);
        const viaPath = cyclePath.slice(0, -1).map((s) => '"' + s.name.value + '"').join(", ");
        context.reportError(new GraphQLError(`Cannot spread fragment "${spreadName}" within itself` + (viaPath !== "" ? ` via ${viaPath}.` : "."), {
          nodes: cyclePath
        }));
      }
      spreadPath.pop();
    }
    spreadPathIndexByName[fragmentName] = undefined;
  }
}

// node_modules/graphql/validation/rules/NoUndefinedVariablesRule.mjs
function NoUndefinedVariablesRule(context) {
  let variableNameDefined = Object.create(null);
  return {
    OperationDefinition: {
      enter() {
        variableNameDefined = Object.create(null);
      },
      leave(operation) {
        const usages = context.getRecursiveVariableUsages(operation);
        for (const { node } of usages) {
          const varName = node.name.value;
          if (variableNameDefined[varName] !== true) {
            context.reportError(new GraphQLError(operation.name ? `Variable "$${varName}" is not defined by operation "${operation.name.value}".` : `Variable "$${varName}" is not defined.`, {
              nodes: [node, operation]
            }));
          }
        }
      }
    },
    VariableDefinition(node) {
      variableNameDefined[node.variable.name.value] = true;
    }
  };
}

// node_modules/graphql/validation/rules/NoUnusedFragmentsRule.mjs
function NoUnusedFragmentsRule(context) {
  const operationDefs = [];
  const fragmentDefs = [];
  return {
    OperationDefinition(node) {
      operationDefs.push(node);
      return false;
    },
    FragmentDefinition(node) {
      fragmentDefs.push(node);
      return false;
    },
    Document: {
      leave() {
        const fragmentNameUsed = Object.create(null);
        for (const operation of operationDefs) {
          for (const fragment of context.getRecursivelyReferencedFragments(operation)) {
            fragmentNameUsed[fragment.name.value] = true;
          }
        }
        for (const fragmentDef of fragmentDefs) {
          const fragName = fragmentDef.name.value;
          if (fragmentNameUsed[fragName] !== true) {
            context.reportError(new GraphQLError(`Fragment "${fragName}" is never used.`, {
              nodes: fragmentDef
            }));
          }
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/NoUnusedVariablesRule.mjs
function NoUnusedVariablesRule(context) {
  let variableDefs = [];
  return {
    OperationDefinition: {
      enter() {
        variableDefs = [];
      },
      leave(operation) {
        const variableNameUsed = Object.create(null);
        const usages = context.getRecursiveVariableUsages(operation);
        for (const { node } of usages) {
          variableNameUsed[node.name.value] = true;
        }
        for (const variableDef of variableDefs) {
          const variableName = variableDef.variable.name.value;
          if (variableNameUsed[variableName] !== true) {
            context.reportError(new GraphQLError(operation.name ? `Variable "$${variableName}" is never used in operation "${operation.name.value}".` : `Variable "$${variableName}" is never used.`, {
              nodes: variableDef
            }));
          }
        }
      }
    },
    VariableDefinition(def) {
      variableDefs.push(def);
    }
  };
}

// node_modules/graphql/utilities/sortValueNode.mjs
function sortValueNode(valueNode) {
  switch (valueNode.kind) {
    case Kind.OBJECT:
      return { ...valueNode, fields: sortFields(valueNode.fields) };
    case Kind.LIST:
      return { ...valueNode, values: valueNode.values.map(sortValueNode) };
    case Kind.INT:
    case Kind.FLOAT:
    case Kind.STRING:
    case Kind.BOOLEAN:
    case Kind.NULL:
    case Kind.ENUM:
    case Kind.VARIABLE:
      return valueNode;
  }
}
function sortFields(fields) {
  return fields.map((fieldNode) => ({
    ...fieldNode,
    value: sortValueNode(fieldNode.value)
  })).sort((fieldA, fieldB) => naturalCompare(fieldA.name.value, fieldB.name.value));
}

// node_modules/graphql/validation/rules/OverlappingFieldsCanBeMergedRule.mjs
function reasonMessage(reason) {
  if (Array.isArray(reason)) {
    return reason.map(([responseName, subReason]) => `subfields "${responseName}" conflict because ` + reasonMessage(subReason)).join(" and ");
  }
  return reason;
}
function OverlappingFieldsCanBeMergedRule(context) {
  const comparedFieldsAndFragmentPairs = new OrderedPairSet;
  const comparedFragmentPairs = new PairSet;
  const cachedFieldsAndFragmentNames = new Map;
  return {
    SelectionSet(selectionSet) {
      const conflicts = findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, context.getParentType(), selectionSet);
      for (const [[responseName, reason], fields1, fields2] of conflicts) {
        const reasonMsg = reasonMessage(reason);
        context.reportError(new GraphQLError(`Fields "${responseName}" conflict because ${reasonMsg}. Use different aliases on the fields to fetch both if this was intentional.`, {
          nodes: fields1.concat(fields2)
        }));
      }
    }
  };
}
function findConflictsWithinSelectionSet(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentType, selectionSet) {
  const conflicts = [];
  const [fieldMap, fragmentNames] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet);
  collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, fieldMap);
  if (fragmentNames.length !== 0) {
    for (let i = 0;i < fragmentNames.length; i++) {
      collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, fieldMap, fragmentNames[i]);
      for (let j = i + 1;j < fragmentNames.length; j++) {
        collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, fragmentNames[i], fragmentNames[j]);
      }
    }
  }
  return conflicts;
}
function collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fragmentName) {
  if (comparedFieldsAndFragmentPairs.has(fieldMap, fragmentName, areMutuallyExclusive)) {
    return;
  }
  comparedFieldsAndFragmentPairs.add(fieldMap, fragmentName, areMutuallyExclusive);
  const fragment = context.getFragment(fragmentName);
  if (!fragment) {
    return;
  }
  const [fieldMap2, referencedFragmentNames] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment);
  if (fieldMap === fieldMap2) {
    return;
  }
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, fieldMap2);
  for (const referencedFragmentName of referencedFragmentNames) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap, referencedFragmentName);
  }
}
function collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentName2) {
  if (fragmentName1 === fragmentName2) {
    return;
  }
  if (comparedFragmentPairs.has(fragmentName1, fragmentName2, areMutuallyExclusive)) {
    return;
  }
  comparedFragmentPairs.add(fragmentName1, fragmentName2, areMutuallyExclusive);
  const fragment1 = context.getFragment(fragmentName1);
  const fragment2 = context.getFragment(fragmentName2);
  if (!fragment1 || !fragment2) {
    return;
  }
  const [fieldMap1, referencedFragmentNames1] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment1);
  const [fieldMap2, referencedFragmentNames2] = getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment2);
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
  for (const referencedFragmentName2 of referencedFragmentNames2) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, referencedFragmentName2);
  }
  for (const referencedFragmentName1 of referencedFragmentNames1) {
    collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, referencedFragmentName1, fragmentName2);
  }
}
function findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, parentType1, selectionSet1, parentType2, selectionSet2) {
  const conflicts = [];
  const [fieldMap1, fragmentNames1] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType1, selectionSet1);
  const [fieldMap2, fragmentNames2] = getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType2, selectionSet2);
  collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fieldMap2);
  for (const fragmentName2 of fragmentNames2) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap1, fragmentName2);
  }
  for (const fragmentName1 of fragmentNames1) {
    collectConflictsBetweenFieldsAndFragment(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fieldMap2, fragmentName1);
  }
  for (const fragmentName1 of fragmentNames1) {
    for (const fragmentName2 of fragmentNames2) {
      collectConflictsBetweenFragments(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, fragmentName1, fragmentName2);
    }
  }
  return conflicts;
}
function collectConflictsWithin(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, fieldMap) {
  for (const [responseName, fields] of Object.entries(fieldMap)) {
    if (fields.length > 1) {
      for (let i = 0;i < fields.length; i++) {
        for (let j = i + 1;j < fields.length; j++) {
          const conflict = findConflict(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, false, responseName, fields[i], fields[j]);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function collectConflictsBetween(context, conflicts, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, fieldMap1, fieldMap2) {
  for (const [responseName, fields1] of Object.entries(fieldMap1)) {
    const fields2 = fieldMap2[responseName];
    if (fields2) {
      for (const field1 of fields1) {
        for (const field2 of fields2) {
          const conflict = findConflict(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, field2);
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
    }
  }
}
function findConflict(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, parentFieldsAreMutuallyExclusive, responseName, field1, field2) {
  const [parentType1, node1, def1] = field1;
  const [parentType2, node2, def2] = field2;
  const areMutuallyExclusive = parentFieldsAreMutuallyExclusive || parentType1 !== parentType2 && isObjectType(parentType1) && isObjectType(parentType2);
  if (!areMutuallyExclusive) {
    const name1 = node1.name.value;
    const name2 = node2.name.value;
    if (name1 !== name2) {
      return [
        [responseName, `"${name1}" and "${name2}" are different fields`],
        [node1],
        [node2]
      ];
    }
    if (!sameArguments(node1, node2)) {
      return [
        [responseName, "they have differing arguments"],
        [node1],
        [node2]
      ];
    }
  }
  const type1 = def1 === null || def1 === undefined ? undefined : def1.type;
  const type2 = def2 === null || def2 === undefined ? undefined : def2.type;
  if (type1 && type2 && doTypesConflict(type1, type2)) {
    return [
      [
        responseName,
        `they return conflicting types "${inspect(type1)}" and "${inspect(type2)}"`
      ],
      [node1],
      [node2]
    ];
  }
  const selectionSet1 = node1.selectionSet;
  const selectionSet2 = node2.selectionSet;
  if (selectionSet1 && selectionSet2) {
    const conflicts = findConflictsBetweenSubSelectionSets(context, cachedFieldsAndFragmentNames, comparedFieldsAndFragmentPairs, comparedFragmentPairs, areMutuallyExclusive, getNamedType(type1), selectionSet1, getNamedType(type2), selectionSet2);
    return subfieldConflicts(conflicts, responseName, node1, node2);
  }
}
function sameArguments(node1, node2) {
  const args1 = node1.arguments;
  const args2 = node2.arguments;
  if (args1 === undefined || args1.length === 0) {
    return args2 === undefined || args2.length === 0;
  }
  if (args2 === undefined || args2.length === 0) {
    return false;
  }
  if (args1.length !== args2.length) {
    return false;
  }
  const values2 = new Map(args2.map(({ name, value }) => [name.value, value]));
  return args1.every((arg1) => {
    const value1 = arg1.value;
    const value2 = values2.get(arg1.name.value);
    if (value2 === undefined) {
      return false;
    }
    return stringifyValue(value1) === stringifyValue(value2);
  });
}
function stringifyValue(value) {
  return print(sortValueNode(value));
}
function doTypesConflict(type1, type2) {
  if (isListType(type1)) {
    return isListType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isListType(type2)) {
    return true;
  }
  if (isNonNullType(type1)) {
    return isNonNullType(type2) ? doTypesConflict(type1.ofType, type2.ofType) : true;
  }
  if (isNonNullType(type2)) {
    return true;
  }
  if (isLeafType(type1) || isLeafType(type2)) {
    return type1 !== type2;
  }
  return false;
}
function getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, parentType, selectionSet) {
  const cached = cachedFieldsAndFragmentNames.get(selectionSet);
  if (cached) {
    return cached;
  }
  const nodeAndDefs = Object.create(null);
  const fragmentNames = Object.create(null);
  _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames);
  const result = [nodeAndDefs, Object.keys(fragmentNames)];
  cachedFieldsAndFragmentNames.set(selectionSet, result);
  return result;
}
function getReferencedFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragment) {
  const cached = cachedFieldsAndFragmentNames.get(fragment.selectionSet);
  if (cached) {
    return cached;
  }
  const fragmentType = typeFromAST(context.getSchema(), fragment.typeCondition);
  return getFieldsAndFragmentNames(context, cachedFieldsAndFragmentNames, fragmentType, fragment.selectionSet);
}
function _collectFieldsAndFragmentNames(context, parentType, selectionSet, nodeAndDefs, fragmentNames) {
  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        const fieldName = selection.name.value;
        let fieldDef;
        if (isObjectType(parentType) || isInterfaceType(parentType)) {
          fieldDef = parentType.getFields()[fieldName];
        }
        const responseName = selection.alias ? selection.alias.value : fieldName;
        if (!nodeAndDefs[responseName]) {
          nodeAndDefs[responseName] = [];
        }
        nodeAndDefs[responseName].push([parentType, selection, fieldDef]);
        break;
      }
      case Kind.FRAGMENT_SPREAD:
        fragmentNames[selection.name.value] = true;
        break;
      case Kind.INLINE_FRAGMENT: {
        const typeCondition = selection.typeCondition;
        const inlineFragmentType = typeCondition ? typeFromAST(context.getSchema(), typeCondition) : parentType;
        _collectFieldsAndFragmentNames(context, inlineFragmentType, selection.selectionSet, nodeAndDefs, fragmentNames);
        break;
      }
    }
  }
}
function subfieldConflicts(conflicts, responseName, node1, node2) {
  if (conflicts.length > 0) {
    return [
      [responseName, conflicts.map(([reason]) => reason)],
      [node1, ...conflicts.map(([, fields1]) => fields1).flat()],
      [node2, ...conflicts.map(([, , fields2]) => fields2).flat()]
    ];
  }
}

class OrderedPairSet {
  constructor() {
    this._data = new Map;
  }
  has(a, b, weaklyPresent) {
    var _this$_data$get;
    const result = (_this$_data$get = this._data.get(a)) === null || _this$_data$get === undefined ? undefined : _this$_data$get.get(b);
    if (result === undefined) {
      return false;
    }
    return weaklyPresent ? true : weaklyPresent === result;
  }
  add(a, b, weaklyPresent) {
    const map = this._data.get(a);
    if (map === undefined) {
      this._data.set(a, new Map([[b, weaklyPresent]]));
    } else {
      map.set(b, weaklyPresent);
    }
  }
}

class PairSet {
  constructor() {
    this._orderedPairSet = new OrderedPairSet;
  }
  has(a, b, weaklyPresent) {
    return a < b ? this._orderedPairSet.has(a, b, weaklyPresent) : this._orderedPairSet.has(b, a, weaklyPresent);
  }
  add(a, b, weaklyPresent) {
    if (a < b) {
      this._orderedPairSet.add(a, b, weaklyPresent);
    } else {
      this._orderedPairSet.add(b, a, weaklyPresent);
    }
  }
}

// node_modules/graphql/validation/rules/PossibleFragmentSpreadsRule.mjs
function PossibleFragmentSpreadsRule(context) {
  return {
    InlineFragment(node) {
      const fragType = context.getType();
      const parentType = context.getParentType();
      if (isCompositeType(fragType) && isCompositeType(parentType) && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        const parentTypeStr = inspect(parentType);
        const fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError(`Fragment cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, {
          nodes: node
        }));
      }
    },
    FragmentSpread(node) {
      const fragName = node.name.value;
      const fragType = getFragmentType(context, fragName);
      const parentType = context.getParentType();
      if (fragType && parentType && !doTypesOverlap(context.getSchema(), fragType, parentType)) {
        const parentTypeStr = inspect(parentType);
        const fragTypeStr = inspect(fragType);
        context.reportError(new GraphQLError(`Fragment "${fragName}" cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, {
          nodes: node
        }));
      }
    }
  };
}
function getFragmentType(context, name) {
  const frag = context.getFragment(name);
  if (frag) {
    const type = typeFromAST(context.getSchema(), frag.typeCondition);
    if (isCompositeType(type)) {
      return type;
    }
  }
}

// node_modules/graphql/validation/rules/PossibleTypeExtensionsRule.mjs
function PossibleTypeExtensionsRule(context) {
  const schema = context.getSchema();
  const definedTypes = Object.create(null);
  for (const def of context.getDocument().definitions) {
    if (isTypeDefinitionNode(def)) {
      definedTypes[def.name.value] = def;
    }
  }
  return {
    ScalarTypeExtension: checkExtension,
    ObjectTypeExtension: checkExtension,
    InterfaceTypeExtension: checkExtension,
    UnionTypeExtension: checkExtension,
    EnumTypeExtension: checkExtension,
    InputObjectTypeExtension: checkExtension
  };
  function checkExtension(node) {
    const typeName = node.name.value;
    const defNode = definedTypes[typeName];
    const existingType = schema === null || schema === undefined ? undefined : schema.getType(typeName);
    let expectedKind;
    if (defNode) {
      expectedKind = defKindToExtKind[defNode.kind];
    } else if (existingType) {
      expectedKind = typeToExtKind(existingType);
    }
    if (expectedKind) {
      if (expectedKind !== node.kind) {
        const kindStr = extensionKindToTypeName(node.kind);
        context.reportError(new GraphQLError(`Cannot extend non-${kindStr} type "${typeName}".`, {
          nodes: defNode ? [defNode, node] : node
        }));
      }
    } else {
      const allTypeNames = Object.keys({
        ...definedTypes,
        ...schema === null || schema === undefined ? undefined : schema.getTypeMap()
      });
      const suggestedTypes = suggestionList(typeName, allTypeNames);
      context.reportError(new GraphQLError(`Cannot extend type "${typeName}" because it is not defined.` + didYouMean(suggestedTypes), {
        nodes: node.name
      }));
    }
  }
}
var defKindToExtKind = {
  [Kind.SCALAR_TYPE_DEFINITION]: Kind.SCALAR_TYPE_EXTENSION,
  [Kind.OBJECT_TYPE_DEFINITION]: Kind.OBJECT_TYPE_EXTENSION,
  [Kind.INTERFACE_TYPE_DEFINITION]: Kind.INTERFACE_TYPE_EXTENSION,
  [Kind.UNION_TYPE_DEFINITION]: Kind.UNION_TYPE_EXTENSION,
  [Kind.ENUM_TYPE_DEFINITION]: Kind.ENUM_TYPE_EXTENSION,
  [Kind.INPUT_OBJECT_TYPE_DEFINITION]: Kind.INPUT_OBJECT_TYPE_EXTENSION
};
function typeToExtKind(type) {
  if (isScalarType(type)) {
    return Kind.SCALAR_TYPE_EXTENSION;
  }
  if (isObjectType(type)) {
    return Kind.OBJECT_TYPE_EXTENSION;
  }
  if (isInterfaceType(type)) {
    return Kind.INTERFACE_TYPE_EXTENSION;
  }
  if (isUnionType(type)) {
    return Kind.UNION_TYPE_EXTENSION;
  }
  if (isEnumType(type)) {
    return Kind.ENUM_TYPE_EXTENSION;
  }
  if (isInputObjectType(type)) {
    return Kind.INPUT_OBJECT_TYPE_EXTENSION;
  }
  invariant(false, "Unexpected type: " + inspect(type));
}
function extensionKindToTypeName(kind) {
  switch (kind) {
    case Kind.SCALAR_TYPE_EXTENSION:
      return "scalar";
    case Kind.OBJECT_TYPE_EXTENSION:
      return "object";
    case Kind.INTERFACE_TYPE_EXTENSION:
      return "interface";
    case Kind.UNION_TYPE_EXTENSION:
      return "union";
    case Kind.ENUM_TYPE_EXTENSION:
      return "enum";
    case Kind.INPUT_OBJECT_TYPE_EXTENSION:
      return "input object";
    default:
      invariant(false, "Unexpected kind: " + inspect(kind));
  }
}

// node_modules/graphql/validation/rules/ProvidedRequiredArgumentsRule.mjs
function ProvidedRequiredArgumentsRule(context) {
  return {
    ...ProvidedRequiredArgumentsOnDirectivesRule(context),
    Field: {
      leave(fieldNode) {
        var _fieldNode$arguments;
        const fieldDef = context.getFieldDef();
        if (!fieldDef) {
          return false;
        }
        const providedArgs = new Set((_fieldNode$arguments = fieldNode.arguments) === null || _fieldNode$arguments === undefined ? undefined : _fieldNode$arguments.map((arg) => arg.name.value));
        for (const argDef of fieldDef.args) {
          if (!providedArgs.has(argDef.name) && isRequiredArgument(argDef)) {
            const argTypeStr = inspect(argDef.type);
            context.reportError(new GraphQLError(`Field "${fieldDef.name}" argument "${argDef.name}" of type "${argTypeStr}" is required, but it was not provided.`, {
              nodes: fieldNode
            }));
          }
        }
      }
    }
  };
}
function ProvidedRequiredArgumentsOnDirectivesRule(context) {
  var _schema$getDirectives;
  const requiredArgsMap = Object.create(null);
  const schema = context.getSchema();
  const definedDirectives = (_schema$getDirectives = schema === null || schema === undefined ? undefined : schema.getDirectives()) !== null && _schema$getDirectives !== undefined ? _schema$getDirectives : specifiedDirectives;
  for (const directive of definedDirectives) {
    requiredArgsMap[directive.name] = keyMap(directive.args.filter(isRequiredArgument), (arg) => arg.name);
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      var _def$arguments;
      const argNodes = (_def$arguments = def.arguments) !== null && _def$arguments !== undefined ? _def$arguments : [];
      requiredArgsMap[def.name.value] = keyMap(argNodes.filter(isRequiredArgumentNode), (arg) => arg.name.value);
    }
  }
  return {
    Directive: {
      leave(directiveNode) {
        const directiveName = directiveNode.name.value;
        const requiredArgs = requiredArgsMap[directiveName];
        if (requiredArgs) {
          var _directiveNode$argume;
          const argNodes = (_directiveNode$argume = directiveNode.arguments) !== null && _directiveNode$argume !== undefined ? _directiveNode$argume : [];
          const argNodeMap = new Set(argNodes.map((arg) => arg.name.value));
          for (const [argName, argDef] of Object.entries(requiredArgs)) {
            if (!argNodeMap.has(argName)) {
              const argType = isType(argDef.type) ? inspect(argDef.type) : print(argDef.type);
              context.reportError(new GraphQLError(`Directive "@${directiveName}" argument "${argName}" of type "${argType}" is required, but it was not provided.`, {
                nodes: directiveNode
              }));
            }
          }
        }
      }
    }
  };
}
function isRequiredArgumentNode(arg) {
  return arg.type.kind === Kind.NON_NULL_TYPE && arg.defaultValue == null;
}

// node_modules/graphql/validation/rules/ScalarLeafsRule.mjs
function ScalarLeafsRule(context) {
  return {
    Field(node) {
      const type = context.getType();
      const selectionSet = node.selectionSet;
      if (type) {
        if (isLeafType(getNamedType(type))) {
          if (selectionSet) {
            const fieldName = node.name.value;
            const typeStr = inspect(type);
            context.reportError(new GraphQLError(`Field "${fieldName}" must not have a selection since type "${typeStr}" has no subfields.`, {
              nodes: selectionSet
            }));
          }
        } else if (!selectionSet) {
          const fieldName = node.name.value;
          const typeStr = inspect(type);
          context.reportError(new GraphQLError(`Field "${fieldName}" of type "${typeStr}" must have a selection of subfields. Did you mean "${fieldName} { ... }"?`, {
            nodes: node
          }));
        } else if (selectionSet.selections.length === 0) {
          const fieldName = node.name.value;
          const typeStr = inspect(type);
          context.reportError(new GraphQLError(`Field "${fieldName}" of type "${typeStr}" must have at least one field selected.`, {
            nodes: node
          }));
        }
      }
    }
  };
}

// node_modules/graphql/utilities/valueFromAST.mjs
function valueFromAST(valueNode, type, variables) {
  if (!valueNode) {
    return;
  }
  if (valueNode.kind === Kind.VARIABLE) {
    const variableName = valueNode.name.value;
    if (variables == null || variables[variableName] === undefined) {
      return;
    }
    const variableValue = variables[variableName];
    if (variableValue === null && isNonNullType(type)) {
      return;
    }
    return variableValue;
  }
  if (isNonNullType(type)) {
    if (valueNode.kind === Kind.NULL) {
      return;
    }
    return valueFromAST(valueNode, type.ofType, variables);
  }
  if (valueNode.kind === Kind.NULL) {
    return null;
  }
  if (isListType(type)) {
    const itemType = type.ofType;
    if (valueNode.kind === Kind.LIST) {
      const coercedValues = [];
      for (const itemNode of valueNode.values) {
        if (isMissingVariable(itemNode, variables)) {
          if (isNonNullType(itemType)) {
            return;
          }
          coercedValues.push(null);
        } else {
          const itemValue = valueFromAST(itemNode, itemType, variables);
          if (itemValue === undefined) {
            return;
          }
          coercedValues.push(itemValue);
        }
      }
      return coercedValues;
    }
    const coercedValue = valueFromAST(valueNode, itemType, variables);
    if (coercedValue === undefined) {
      return;
    }
    return [coercedValue];
  }
  if (isInputObjectType(type)) {
    if (valueNode.kind !== Kind.OBJECT) {
      return;
    }
    const coercedObj = Object.create(null);
    const fieldNodes = keyMap(valueNode.fields, (field) => field.name.value);
    for (const field of Object.values(type.getFields())) {
      const fieldNode = fieldNodes[field.name];
      if (!fieldNode || isMissingVariable(fieldNode.value, variables)) {
        if (field.defaultValue !== undefined) {
          coercedObj[field.name] = field.defaultValue;
        } else if (isNonNullType(field.type)) {
          return;
        }
        continue;
      }
      const fieldValue = valueFromAST(fieldNode.value, field.type, variables);
      if (fieldValue === undefined) {
        return;
      }
      coercedObj[field.name] = fieldValue;
    }
    if (type.isOneOf) {
      const keys = Object.keys(coercedObj);
      if (keys.length !== 1) {
        return;
      }
      if (coercedObj[keys[0]] === null) {
        return;
      }
    }
    return coercedObj;
  }
  if (isLeafType(type)) {
    let result;
    try {
      result = type.parseLiteral(valueNode, variables);
    } catch (_error) {
      return;
    }
    if (result === undefined) {
      return;
    }
    return result;
  }
  invariant(false, "Unexpected input type: " + inspect(type));
}
function isMissingVariable(valueNode, variables) {
  return valueNode.kind === Kind.VARIABLE && (variables == null || variables[valueNode.name.value] === undefined);
}

// node_modules/graphql/execution/values.mjs
function getArgumentValues(def, node, variableValues) {
  var _node$arguments;
  const coercedValues = {};
  const argumentNodes = (_node$arguments = node.arguments) !== null && _node$arguments !== undefined ? _node$arguments : [];
  const argNodeMap = keyMap(argumentNodes, (arg) => arg.name.value);
  for (const argDef of def.args) {
    const name = argDef.name;
    const argType = argDef.type;
    const argumentNode = argNodeMap[name];
    if (!argumentNode) {
      if (argDef.defaultValue !== undefined) {
        coercedValues[name] = argDef.defaultValue;
      } else if (isNonNullType(argType)) {
        throw new GraphQLError(`Argument "${name}" of required type "${inspect(argType)}" ` + "was not provided.", {
          nodes: node
        });
      }
      continue;
    }
    const valueNode = argumentNode.value;
    let isNull = valueNode.kind === Kind.NULL;
    if (valueNode.kind === Kind.VARIABLE) {
      const variableName = valueNode.name.value;
      if (variableValues == null || !hasOwnProperty(variableValues, variableName)) {
        if (argDef.defaultValue !== undefined) {
          coercedValues[name] = argDef.defaultValue;
        } else if (isNonNullType(argType)) {
          throw new GraphQLError(`Argument "${name}" of required type "${inspect(argType)}" ` + `was provided the variable "$${variableName}" which was not provided a runtime value.`, {
            nodes: valueNode
          });
        }
        continue;
      }
      isNull = variableValues[variableName] == null;
    }
    if (isNull && isNonNullType(argType)) {
      throw new GraphQLError(`Argument "${name}" of non-null type "${inspect(argType)}" ` + "must not be null.", {
        nodes: valueNode
      });
    }
    const coercedValue = valueFromAST(valueNode, argType, variableValues);
    if (coercedValue === undefined) {
      throw new GraphQLError(`Argument "${name}" has invalid value ${print(valueNode)}.`, {
        nodes: valueNode
      });
    }
    coercedValues[name] = coercedValue;
  }
  return coercedValues;
}
function getDirectiveValues(directiveDef, node, variableValues) {
  var _node$directives;
  const directiveNode = (_node$directives = node.directives) === null || _node$directives === undefined ? undefined : _node$directives.find((directive) => directive.name.value === directiveDef.name);
  if (directiveNode) {
    return getArgumentValues(directiveDef, directiveNode, variableValues);
  }
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

// node_modules/graphql/execution/collectFields.mjs
function collectFields(schema, fragments, variableValues, runtimeType, selectionSet) {
  const fields = new Map;
  collectFieldsImpl(schema, fragments, variableValues, runtimeType, selectionSet, fields, new Set);
  return fields;
}
function collectFieldsImpl(schema, fragments, variableValues, runtimeType, selectionSet, fields, visitedFragmentNames) {
  for (const selection of selectionSet.selections) {
    switch (selection.kind) {
      case Kind.FIELD: {
        if (!shouldIncludeNode(variableValues, selection)) {
          continue;
        }
        const name = getFieldEntryKey(selection);
        const fieldList = fields.get(name);
        if (fieldList !== undefined) {
          fieldList.push(selection);
        } else {
          fields.set(name, [selection]);
        }
        break;
      }
      case Kind.INLINE_FRAGMENT: {
        if (!shouldIncludeNode(variableValues, selection) || !doesFragmentConditionMatch(schema, selection, runtimeType)) {
          continue;
        }
        collectFieldsImpl(schema, fragments, variableValues, runtimeType, selection.selectionSet, fields, visitedFragmentNames);
        break;
      }
      case Kind.FRAGMENT_SPREAD: {
        const fragName = selection.name.value;
        if (visitedFragmentNames.has(fragName) || !shouldIncludeNode(variableValues, selection)) {
          continue;
        }
        visitedFragmentNames.add(fragName);
        const fragment = fragments[fragName];
        if (!fragment || !doesFragmentConditionMatch(schema, fragment, runtimeType)) {
          continue;
        }
        collectFieldsImpl(schema, fragments, variableValues, runtimeType, fragment.selectionSet, fields, visitedFragmentNames);
        break;
      }
    }
  }
}
function shouldIncludeNode(variableValues, node) {
  const skip = getDirectiveValues(GraphQLSkipDirective, node, variableValues);
  if ((skip === null || skip === undefined ? undefined : skip.if) === true) {
    return false;
  }
  const include = getDirectiveValues(GraphQLIncludeDirective, node, variableValues);
  if ((include === null || include === undefined ? undefined : include.if) === false) {
    return false;
  }
  return true;
}
function doesFragmentConditionMatch(schema, fragment, type) {
  const typeConditionNode = fragment.typeCondition;
  if (!typeConditionNode) {
    return true;
  }
  const conditionalType = typeFromAST(schema, typeConditionNode);
  if (conditionalType === type) {
    return true;
  }
  if (isAbstractType(conditionalType)) {
    return schema.isSubType(conditionalType, type);
  }
  return false;
}
function getFieldEntryKey(node) {
  return node.alias ? node.alias.value : node.name.value;
}

// node_modules/graphql/validation/rules/SingleFieldSubscriptionsRule.mjs
function SingleFieldSubscriptionsRule(context) {
  return {
    OperationDefinition(node) {
      if (node.operation === "subscription") {
        const schema = context.getSchema();
        const subscriptionType = schema.getSubscriptionType();
        if (subscriptionType) {
          const operationName = node.name ? node.name.value : null;
          const variableValues = Object.create(null);
          const document = context.getDocument();
          const fragments = Object.create(null);
          for (const definition of document.definitions) {
            if (definition.kind === Kind.FRAGMENT_DEFINITION) {
              fragments[definition.name.value] = definition;
            }
          }
          const fields = collectFields(schema, fragments, variableValues, subscriptionType, node.selectionSet);
          if (fields.size > 1) {
            const fieldSelectionLists = [...fields.values()];
            const extraFieldSelectionLists = fieldSelectionLists.slice(1);
            const extraFieldSelections = extraFieldSelectionLists.flat();
            context.reportError(new GraphQLError(operationName != null ? `Subscription "${operationName}" must select only one top level field.` : "Anonymous Subscription must select only one top level field.", {
              nodes: extraFieldSelections
            }));
          }
          for (const fieldNodes of fields.values()) {
            const field = fieldNodes[0];
            const fieldName = field.name.value;
            if (fieldName.startsWith("__")) {
              context.reportError(new GraphQLError(operationName != null ? `Subscription "${operationName}" must not select an introspection top level field.` : "Anonymous Subscription must not select an introspection top level field.", {
                nodes: fieldNodes
              }));
            }
          }
        }
      }
    }
  };
}

// node_modules/graphql/jsutils/groupBy.mjs
function groupBy(list, keyFn) {
  const result = new Map;
  for (const item of list) {
    const key = keyFn(item);
    const group = result.get(key);
    if (group === undefined) {
      result.set(key, [item]);
    } else {
      group.push(item);
    }
  }
  return result;
}

// node_modules/graphql/validation/rules/UniqueArgumentDefinitionNamesRule.mjs
function UniqueArgumentDefinitionNamesRule(context) {
  return {
    DirectiveDefinition(directiveNode) {
      var _directiveNode$argume;
      const argumentNodes = (_directiveNode$argume = directiveNode.arguments) !== null && _directiveNode$argume !== undefined ? _directiveNode$argume : [];
      return checkArgUniqueness(`@${directiveNode.name.value}`, argumentNodes);
    },
    InterfaceTypeDefinition: checkArgUniquenessPerField,
    InterfaceTypeExtension: checkArgUniquenessPerField,
    ObjectTypeDefinition: checkArgUniquenessPerField,
    ObjectTypeExtension: checkArgUniquenessPerField
  };
  function checkArgUniquenessPerField(typeNode) {
    var _typeNode$fields;
    const typeName = typeNode.name.value;
    const fieldNodes = (_typeNode$fields = typeNode.fields) !== null && _typeNode$fields !== undefined ? _typeNode$fields : [];
    for (const fieldDef of fieldNodes) {
      var _fieldDef$arguments;
      const fieldName = fieldDef.name.value;
      const argumentNodes = (_fieldDef$arguments = fieldDef.arguments) !== null && _fieldDef$arguments !== undefined ? _fieldDef$arguments : [];
      checkArgUniqueness(`${typeName}.${fieldName}`, argumentNodes);
    }
    return false;
  }
  function checkArgUniqueness(parentName, argumentNodes) {
    const seenArgs = groupBy(argumentNodes, (arg) => arg.name.value);
    for (const [argName, argNodes] of seenArgs) {
      if (argNodes.length > 1) {
        context.reportError(new GraphQLError(`Argument "${parentName}(${argName}:)" can only be defined once.`, {
          nodes: argNodes.map((node) => node.name)
        }));
      }
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueArgumentNamesRule.mjs
function UniqueArgumentNamesRule(context) {
  return {
    Field: checkArgUniqueness,
    Directive: checkArgUniqueness
  };
  function checkArgUniqueness(parentNode) {
    var _parentNode$arguments;
    const argumentNodes = (_parentNode$arguments = parentNode.arguments) !== null && _parentNode$arguments !== undefined ? _parentNode$arguments : [];
    const seenArgs = groupBy(argumentNodes, (arg) => arg.name.value);
    for (const [argName, argNodes] of seenArgs) {
      if (argNodes.length > 1) {
        context.reportError(new GraphQLError(`There can be only one argument named "${argName}".`, {
          nodes: argNodes.map((node) => node.name)
        }));
      }
    }
  }
}

// node_modules/graphql/validation/rules/UniqueDirectiveNamesRule.mjs
function UniqueDirectiveNamesRule(context) {
  const knownDirectiveNames = Object.create(null);
  const schema = context.getSchema();
  return {
    DirectiveDefinition(node) {
      const directiveName = node.name.value;
      if (schema !== null && schema !== undefined && schema.getDirective(directiveName)) {
        context.reportError(new GraphQLError(`Directive "@${directiveName}" already exists in the schema. It cannot be redefined.`, {
          nodes: node.name
        }));
        return;
      }
      if (knownDirectiveNames[directiveName]) {
        context.reportError(new GraphQLError(`There can be only one directive named "@${directiveName}".`, {
          nodes: [knownDirectiveNames[directiveName], node.name]
        }));
      } else {
        knownDirectiveNames[directiveName] = node.name;
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/UniqueDirectivesPerLocationRule.mjs
function UniqueDirectivesPerLocationRule(context) {
  const uniqueDirectiveMap = Object.create(null);
  const schema = context.getSchema();
  const definedDirectives = schema ? schema.getDirectives() : specifiedDirectives;
  for (const directive of definedDirectives) {
    uniqueDirectiveMap[directive.name] = !directive.isRepeatable;
  }
  const astDefinitions = context.getDocument().definitions;
  for (const def of astDefinitions) {
    if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      uniqueDirectiveMap[def.name.value] = !def.repeatable;
    }
  }
  const schemaDirectives = Object.create(null);
  const typeDirectivesMap = Object.create(null);
  return {
    enter(node) {
      if (!("directives" in node) || !node.directives) {
        return;
      }
      let seenDirectives;
      if (node.kind === Kind.SCHEMA_DEFINITION || node.kind === Kind.SCHEMA_EXTENSION) {
        seenDirectives = schemaDirectives;
      } else if (isTypeDefinitionNode(node) || isTypeExtensionNode(node)) {
        const typeName = node.name.value;
        seenDirectives = typeDirectivesMap[typeName];
        if (seenDirectives === undefined) {
          typeDirectivesMap[typeName] = seenDirectives = Object.create(null);
        }
      } else {
        seenDirectives = Object.create(null);
      }
      for (const directive of node.directives) {
        const directiveName = directive.name.value;
        if (uniqueDirectiveMap[directiveName]) {
          if (seenDirectives[directiveName]) {
            context.reportError(new GraphQLError(`The directive "@${directiveName}" can only be used once at this location.`, {
              nodes: [seenDirectives[directiveName], directive]
            }));
          } else {
            seenDirectives[directiveName] = directive;
          }
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/UniqueEnumValueNamesRule.mjs
function UniqueEnumValueNamesRule(context) {
  const schema = context.getSchema();
  const existingTypeMap = schema ? schema.getTypeMap() : Object.create(null);
  const knownValueNames = Object.create(null);
  return {
    EnumTypeDefinition: checkValueUniqueness,
    EnumTypeExtension: checkValueUniqueness
  };
  function checkValueUniqueness(node) {
    var _node$values;
    const typeName = node.name.value;
    if (!knownValueNames[typeName]) {
      knownValueNames[typeName] = Object.create(null);
    }
    const valueNodes = (_node$values = node.values) !== null && _node$values !== undefined ? _node$values : [];
    const valueNames = knownValueNames[typeName];
    for (const valueDef of valueNodes) {
      const valueName = valueDef.name.value;
      const existingType = existingTypeMap[typeName];
      if (isEnumType(existingType) && existingType.getValue(valueName)) {
        context.reportError(new GraphQLError(`Enum value "${typeName}.${valueName}" already exists in the schema. It cannot also be defined in this type extension.`, {
          nodes: valueDef.name
        }));
      } else if (valueNames[valueName]) {
        context.reportError(new GraphQLError(`Enum value "${typeName}.${valueName}" can only be defined once.`, {
          nodes: [valueNames[valueName], valueDef.name]
        }));
      } else {
        valueNames[valueName] = valueDef.name;
      }
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueFieldDefinitionNamesRule.mjs
function UniqueFieldDefinitionNamesRule(context) {
  const schema = context.getSchema();
  const existingTypeMap = schema ? schema.getTypeMap() : Object.create(null);
  const knownFieldNames = Object.create(null);
  return {
    InputObjectTypeDefinition: checkFieldUniqueness,
    InputObjectTypeExtension: checkFieldUniqueness,
    InterfaceTypeDefinition: checkFieldUniqueness,
    InterfaceTypeExtension: checkFieldUniqueness,
    ObjectTypeDefinition: checkFieldUniqueness,
    ObjectTypeExtension: checkFieldUniqueness
  };
  function checkFieldUniqueness(node) {
    var _node$fields;
    const typeName = node.name.value;
    if (!knownFieldNames[typeName]) {
      knownFieldNames[typeName] = Object.create(null);
    }
    const fieldNodes = (_node$fields = node.fields) !== null && _node$fields !== undefined ? _node$fields : [];
    const fieldNames = knownFieldNames[typeName];
    for (const fieldDef of fieldNodes) {
      const fieldName = fieldDef.name.value;
      if (hasField(existingTypeMap[typeName], fieldName)) {
        context.reportError(new GraphQLError(`Field "${typeName}.${fieldName}" already exists in the schema. It cannot also be defined in this type extension.`, {
          nodes: fieldDef.name
        }));
      } else if (fieldNames[fieldName]) {
        context.reportError(new GraphQLError(`Field "${typeName}.${fieldName}" can only be defined once.`, {
          nodes: [fieldNames[fieldName], fieldDef.name]
        }));
      } else {
        fieldNames[fieldName] = fieldDef.name;
      }
    }
    return false;
  }
}
function hasField(type, fieldName) {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    return type.getFields()[fieldName] != null;
  }
  return false;
}

// node_modules/graphql/validation/rules/UniqueFragmentNamesRule.mjs
function UniqueFragmentNamesRule(context) {
  const knownFragmentNames = Object.create(null);
  return {
    OperationDefinition: () => false,
    FragmentDefinition(node) {
      const fragmentName = node.name.value;
      if (knownFragmentNames[fragmentName]) {
        context.reportError(new GraphQLError(`There can be only one fragment named "${fragmentName}".`, {
          nodes: [knownFragmentNames[fragmentName], node.name]
        }));
      } else {
        knownFragmentNames[fragmentName] = node.name;
      }
      return false;
    }
  };
}

// node_modules/graphql/validation/rules/UniqueInputFieldNamesRule.mjs
function UniqueInputFieldNamesRule(context) {
  const knownNameStack = [];
  let knownNames = Object.create(null);
  return {
    ObjectValue: {
      enter() {
        knownNameStack.push(knownNames);
        knownNames = Object.create(null);
      },
      leave() {
        const prevKnownNames = knownNameStack.pop();
        prevKnownNames || invariant(false);
        knownNames = prevKnownNames;
      }
    },
    ObjectField(node) {
      const fieldName = node.name.value;
      if (knownNames[fieldName]) {
        context.reportError(new GraphQLError(`There can be only one input field named "${fieldName}".`, {
          nodes: [knownNames[fieldName], node.name]
        }));
      } else {
        knownNames[fieldName] = node.name;
      }
    }
  };
}

// node_modules/graphql/validation/rules/UniqueOperationNamesRule.mjs
function UniqueOperationNamesRule(context) {
  const knownOperationNames = Object.create(null);
  return {
    OperationDefinition(node) {
      const operationName = node.name;
      if (operationName) {
        if (knownOperationNames[operationName.value]) {
          context.reportError(new GraphQLError(`There can be only one operation named "${operationName.value}".`, {
            nodes: [
              knownOperationNames[operationName.value],
              operationName
            ]
          }));
        } else {
          knownOperationNames[operationName.value] = operationName;
        }
      }
      return false;
    },
    FragmentDefinition: () => false
  };
}

// node_modules/graphql/validation/rules/UniqueOperationTypesRule.mjs
function UniqueOperationTypesRule(context) {
  const schema = context.getSchema();
  const definedOperationTypes = Object.create(null);
  const existingOperationTypes = schema ? {
    query: schema.getQueryType(),
    mutation: schema.getMutationType(),
    subscription: schema.getSubscriptionType()
  } : {};
  return {
    SchemaDefinition: checkOperationTypes,
    SchemaExtension: checkOperationTypes
  };
  function checkOperationTypes(node) {
    var _node$operationTypes;
    const operationTypesNodes = (_node$operationTypes = node.operationTypes) !== null && _node$operationTypes !== undefined ? _node$operationTypes : [];
    for (const operationType of operationTypesNodes) {
      const operation = operationType.operation;
      const alreadyDefinedOperationType = definedOperationTypes[operation];
      if (existingOperationTypes[operation]) {
        context.reportError(new GraphQLError(`Type for ${operation} already defined in the schema. It cannot be redefined.`, {
          nodes: operationType
        }));
      } else if (alreadyDefinedOperationType) {
        context.reportError(new GraphQLError(`There can be only one ${operation} type in schema.`, {
          nodes: [alreadyDefinedOperationType, operationType]
        }));
      } else {
        definedOperationTypes[operation] = operationType;
      }
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueTypeNamesRule.mjs
function UniqueTypeNamesRule(context) {
  const knownTypeNames = Object.create(null);
  const schema = context.getSchema();
  return {
    ScalarTypeDefinition: checkTypeName,
    ObjectTypeDefinition: checkTypeName,
    InterfaceTypeDefinition: checkTypeName,
    UnionTypeDefinition: checkTypeName,
    EnumTypeDefinition: checkTypeName,
    InputObjectTypeDefinition: checkTypeName
  };
  function checkTypeName(node) {
    const typeName = node.name.value;
    if (schema !== null && schema !== undefined && schema.getType(typeName)) {
      context.reportError(new GraphQLError(`Type "${typeName}" already exists in the schema. It cannot also be defined in this type definition.`, {
        nodes: node.name
      }));
      return;
    }
    if (knownTypeNames[typeName]) {
      context.reportError(new GraphQLError(`There can be only one type named "${typeName}".`, {
        nodes: [knownTypeNames[typeName], node.name]
      }));
    } else {
      knownTypeNames[typeName] = node.name;
    }
    return false;
  }
}

// node_modules/graphql/validation/rules/UniqueVariableNamesRule.mjs
function UniqueVariableNamesRule(context) {
  return {
    OperationDefinition(operationNode) {
      var _operationNode$variab;
      const variableDefinitions = (_operationNode$variab = operationNode.variableDefinitions) !== null && _operationNode$variab !== undefined ? _operationNode$variab : [];
      const seenVariableDefinitions = groupBy(variableDefinitions, (node) => node.variable.name.value);
      for (const [variableName, variableNodes] of seenVariableDefinitions) {
        if (variableNodes.length > 1) {
          context.reportError(new GraphQLError(`There can be only one variable named "$${variableName}".`, {
            nodes: variableNodes.map((node) => node.variable.name)
          }));
        }
      }
    }
  };
}

// node_modules/graphql/validation/rules/ValuesOfCorrectTypeRule.mjs
function ValuesOfCorrectTypeRule(context) {
  let variableDefinitions = {};
  return {
    OperationDefinition: {
      enter() {
        variableDefinitions = {};
      }
    },
    VariableDefinition(definition) {
      variableDefinitions[definition.variable.name.value] = definition;
    },
    ListValue(node) {
      const type = getNullableType(context.getParentInputType());
      if (!isListType(type)) {
        isValidValueNode(context, node);
        return false;
      }
    },
    ObjectValue(node) {
      const type = getNamedType(context.getInputType());
      if (!isInputObjectType(type)) {
        isValidValueNode(context, node);
        return false;
      }
      const fieldNodeMap = keyMap(node.fields, (field) => field.name.value);
      for (const fieldDef of Object.values(type.getFields())) {
        const fieldNode = fieldNodeMap[fieldDef.name];
        if (!fieldNode && isRequiredInputField(fieldDef)) {
          const typeStr = inspect(fieldDef.type);
          context.reportError(new GraphQLError(`Field "${type.name}.${fieldDef.name}" of required type "${typeStr}" was not provided.`, {
            nodes: node
          }));
        }
      }
      if (type.isOneOf) {
        validateOneOfInputObject(context, node, type, fieldNodeMap, variableDefinitions);
      }
    },
    ObjectField(node) {
      const parentType = getNamedType(context.getParentInputType());
      const fieldType = context.getInputType();
      if (!fieldType && isInputObjectType(parentType)) {
        const suggestions = suggestionList(node.name.value, Object.keys(parentType.getFields()));
        context.reportError(new GraphQLError(`Field "${node.name.value}" is not defined by type "${parentType.name}".` + didYouMean(suggestions), {
          nodes: node
        }));
      }
    },
    NullValue(node) {
      const type = context.getInputType();
      if (isNonNullType(type)) {
        context.reportError(new GraphQLError(`Expected value of type "${inspect(type)}", found ${print(node)}.`, {
          nodes: node
        }));
      }
    },
    EnumValue: (node) => isValidValueNode(context, node),
    IntValue: (node) => isValidValueNode(context, node),
    FloatValue: (node) => isValidValueNode(context, node),
    StringValue: (node) => isValidValueNode(context, node),
    BooleanValue: (node) => isValidValueNode(context, node)
  };
}
function isValidValueNode(context, node) {
  const locationType = context.getInputType();
  if (!locationType) {
    return;
  }
  const type = getNamedType(locationType);
  if (!isLeafType(type)) {
    const typeStr = inspect(locationType);
    context.reportError(new GraphQLError(`Expected value of type "${typeStr}", found ${print(node)}.`, {
      nodes: node
    }));
    return;
  }
  try {
    const parseResult = type.parseLiteral(node, undefined);
    if (parseResult === undefined) {
      const typeStr = inspect(locationType);
      context.reportError(new GraphQLError(`Expected value of type "${typeStr}", found ${print(node)}.`, {
        nodes: node
      }));
    }
  } catch (error) {
    const typeStr = inspect(locationType);
    if (error instanceof GraphQLError) {
      context.reportError(error);
    } else {
      context.reportError(new GraphQLError(`Expected value of type "${typeStr}", found ${print(node)}; ` + error.message, {
        nodes: node,
        originalError: error
      }));
    }
  }
}
function validateOneOfInputObject(context, node, type, fieldNodeMap, variableDefinitions) {
  var _fieldNodeMap$keys$;
  const keys = Object.keys(fieldNodeMap);
  const isNotExactlyOneField = keys.length !== 1;
  if (isNotExactlyOneField) {
    context.reportError(new GraphQLError(`OneOf Input Object "${type.name}" must specify exactly one key.`, {
      nodes: [node]
    }));
    return;
  }
  const value = (_fieldNodeMap$keys$ = fieldNodeMap[keys[0]]) === null || _fieldNodeMap$keys$ === undefined ? undefined : _fieldNodeMap$keys$.value;
  const isNullLiteral = !value || value.kind === Kind.NULL;
  const isVariable = (value === null || value === undefined ? undefined : value.kind) === Kind.VARIABLE;
  if (isNullLiteral) {
    context.reportError(new GraphQLError(`Field "${type.name}.${keys[0]}" must be non-null.`, {
      nodes: [node]
    }));
    return;
  }
  if (isVariable) {
    const variableName = value.name.value;
    const definition = variableDefinitions[variableName];
    const isNullableVariable = definition.type.kind !== Kind.NON_NULL_TYPE;
    if (isNullableVariable) {
      context.reportError(new GraphQLError(`Variable "${variableName}" must be non-nullable to be used for OneOf Input Object "${type.name}".`, {
        nodes: [node]
      }));
    }
  }
}

// node_modules/graphql/validation/rules/VariablesAreInputTypesRule.mjs
function VariablesAreInputTypesRule(context) {
  return {
    VariableDefinition(node) {
      const type = typeFromAST(context.getSchema(), node.type);
      if (type !== undefined && !isInputType(type)) {
        const variableName = node.variable.name.value;
        const typeName = print(node.type);
        context.reportError(new GraphQLError(`Variable "$${variableName}" cannot be non-input type "${typeName}".`, {
          nodes: node.type
        }));
      }
    }
  };
}

// node_modules/graphql/validation/rules/VariablesInAllowedPositionRule.mjs
function VariablesInAllowedPositionRule(context) {
  let varDefMap = Object.create(null);
  return {
    OperationDefinition: {
      enter() {
        varDefMap = Object.create(null);
      },
      leave(operation) {
        const usages = context.getRecursiveVariableUsages(operation);
        for (const { node, type, defaultValue, parentType } of usages) {
          const varName = node.name.value;
          const varDef = varDefMap[varName];
          if (varDef && type) {
            const schema = context.getSchema();
            const varType = typeFromAST(schema, varDef.type);
            if (varType && !allowedVariableUsage(schema, varType, varDef.defaultValue, type, defaultValue)) {
              const varTypeStr = inspect(varType);
              const typeStr = inspect(type);
              context.reportError(new GraphQLError(`Variable "$${varName}" of type "${varTypeStr}" used in position expecting type "${typeStr}".`, {
                nodes: [varDef, node]
              }));
            }
            if (isInputObjectType(parentType) && parentType.isOneOf && isNullableType(varType)) {
              context.reportError(new GraphQLError(`Variable "$${varName}" is of type "${varType}" but must be non-nullable to be used for OneOf Input Object "${parentType}".`, {
                nodes: [varDef, node]
              }));
            }
          }
        }
      }
    },
    VariableDefinition(node) {
      varDefMap[node.variable.name.value] = node;
    }
  };
}
function allowedVariableUsage(schema, varType, varDefaultValue, locationType, locationDefaultValue) {
  if (isNonNullType(locationType) && !isNonNullType(varType)) {
    const hasNonNullVariableDefaultValue = varDefaultValue != null && varDefaultValue.kind !== Kind.NULL;
    const hasLocationDefaultValue = locationDefaultValue !== undefined;
    if (!hasNonNullVariableDefaultValue && !hasLocationDefaultValue) {
      return false;
    }
    const nullableLocationType = locationType.ofType;
    return isTypeSubTypeOf(schema, varType, nullableLocationType);
  }
  return isTypeSubTypeOf(schema, varType, locationType);
}

// node_modules/graphql/validation/specifiedRules.mjs
var recommendedRules = Object.freeze([MaxIntrospectionDepthRule]);
var specifiedRules = Object.freeze([
  ExecutableDefinitionsRule,
  UniqueOperationNamesRule,
  LoneAnonymousOperationRule,
  SingleFieldSubscriptionsRule,
  KnownTypeNamesRule,
  FragmentsOnCompositeTypesRule,
  VariablesAreInputTypesRule,
  ScalarLeafsRule,
  FieldsOnCorrectTypeRule,
  UniqueFragmentNamesRule,
  KnownFragmentNamesRule,
  NoUnusedFragmentsRule,
  PossibleFragmentSpreadsRule,
  NoFragmentCyclesRule,
  UniqueVariableNamesRule,
  NoUndefinedVariablesRule,
  NoUnusedVariablesRule,
  KnownDirectivesRule,
  UniqueDirectivesPerLocationRule,
  KnownArgumentNamesRule,
  UniqueArgumentNamesRule,
  ValuesOfCorrectTypeRule,
  ProvidedRequiredArgumentsRule,
  VariablesInAllowedPositionRule,
  OverlappingFieldsCanBeMergedRule,
  UniqueInputFieldNamesRule,
  ...recommendedRules
]);
var specifiedSDLRules = Object.freeze([
  LoneSchemaDefinitionRule,
  UniqueOperationTypesRule,
  UniqueTypeNamesRule,
  UniqueEnumValueNamesRule,
  UniqueFieldDefinitionNamesRule,
  UniqueArgumentDefinitionNamesRule,
  UniqueDirectiveNamesRule,
  KnownTypeNamesRule,
  KnownDirectivesRule,
  UniqueDirectivesPerLocationRule,
  PossibleTypeExtensionsRule,
  KnownArgumentNamesOnDirectivesRule,
  UniqueArgumentNamesRule,
  UniqueInputFieldNamesRule,
  ProvidedRequiredArgumentsOnDirectivesRule
]);

// node_modules/graphql/validation/ValidationContext.mjs
class ASTValidationContext {
  constructor(ast, onError) {
    this._ast = ast;
    this._fragments = undefined;
    this._fragmentSpreads = new Map;
    this._recursivelyReferencedFragments = new Map;
    this._onError = onError;
  }
  get [Symbol.toStringTag]() {
    return "ASTValidationContext";
  }
  reportError(error) {
    this._onError(error);
  }
  getDocument() {
    return this._ast;
  }
  getFragment(name) {
    let fragments;
    if (this._fragments) {
      fragments = this._fragments;
    } else {
      fragments = Object.create(null);
      for (const defNode of this.getDocument().definitions) {
        if (defNode.kind === Kind.FRAGMENT_DEFINITION) {
          fragments[defNode.name.value] = defNode;
        }
      }
      this._fragments = fragments;
    }
    return fragments[name];
  }
  getFragmentSpreads(node) {
    let spreads = this._fragmentSpreads.get(node);
    if (!spreads) {
      spreads = [];
      const setsToVisit = [node];
      let set;
      while (set = setsToVisit.pop()) {
        for (const selection of set.selections) {
          if (selection.kind === Kind.FRAGMENT_SPREAD) {
            spreads.push(selection);
          } else if (selection.selectionSet) {
            setsToVisit.push(selection.selectionSet);
          }
        }
      }
      this._fragmentSpreads.set(node, spreads);
    }
    return spreads;
  }
  getRecursivelyReferencedFragments(operation) {
    let fragments = this._recursivelyReferencedFragments.get(operation);
    if (!fragments) {
      fragments = [];
      const collectedNames = Object.create(null);
      const nodesToVisit = [operation.selectionSet];
      let node;
      while (node = nodesToVisit.pop()) {
        for (const spread of this.getFragmentSpreads(node)) {
          const fragName = spread.name.value;
          if (collectedNames[fragName] !== true) {
            collectedNames[fragName] = true;
            const fragment = this.getFragment(fragName);
            if (fragment) {
              fragments.push(fragment);
              nodesToVisit.push(fragment.selectionSet);
            }
          }
        }
      }
      this._recursivelyReferencedFragments.set(operation, fragments);
    }
    return fragments;
  }
}

class SDLValidationContext extends ASTValidationContext {
  constructor(ast, schema, onError) {
    super(ast, onError);
    this._schema = schema;
  }
  get [Symbol.toStringTag]() {
    return "SDLValidationContext";
  }
  getSchema() {
    return this._schema;
  }
}

class ValidationContext extends ASTValidationContext {
  constructor(schema, ast, typeInfo, onError) {
    super(ast, onError);
    this._schema = schema;
    this._typeInfo = typeInfo;
    this._variableUsages = new Map;
    this._recursiveVariableUsages = new Map;
  }
  get [Symbol.toStringTag]() {
    return "ValidationContext";
  }
  getSchema() {
    return this._schema;
  }
  getVariableUsages(node) {
    let usages = this._variableUsages.get(node);
    if (!usages) {
      const newUsages = [];
      const typeInfo = new TypeInfo(this._schema);
      visit(node, visitWithTypeInfo(typeInfo, {
        VariableDefinition: () => false,
        Variable(variable) {
          newUsages.push({
            node: variable,
            type: typeInfo.getInputType(),
            defaultValue: typeInfo.getDefaultValue(),
            parentType: typeInfo.getParentInputType()
          });
        }
      }));
      usages = newUsages;
      this._variableUsages.set(node, usages);
    }
    return usages;
  }
  getRecursiveVariableUsages(operation) {
    let usages = this._recursiveVariableUsages.get(operation);
    if (!usages) {
      usages = this.getVariableUsages(operation);
      for (const frag of this.getRecursivelyReferencedFragments(operation)) {
        usages = usages.concat(this.getVariableUsages(frag));
      }
      this._recursiveVariableUsages.set(operation, usages);
    }
    return usages;
  }
  getType() {
    return this._typeInfo.getType();
  }
  getParentType() {
    return this._typeInfo.getParentType();
  }
  getInputType() {
    return this._typeInfo.getInputType();
  }
  getParentInputType() {
    return this._typeInfo.getParentInputType();
  }
  getFieldDef() {
    return this._typeInfo.getFieldDef();
  }
  getDirective() {
    return this._typeInfo.getDirective();
  }
  getArgument() {
    return this._typeInfo.getArgument();
  }
  getEnumValue() {
    return this._typeInfo.getEnumValue();
  }
}

// node_modules/graphql/validation/validate.mjs
function validate(schema, documentAST, rules = specifiedRules, options, typeInfo = new TypeInfo(schema)) {
  var _options$maxErrors;
  const maxErrors = (_options$maxErrors = options === null || options === undefined ? undefined : options.maxErrors) !== null && _options$maxErrors !== undefined ? _options$maxErrors : 100;
  documentAST || devAssert(false, "Must provide document.");
  assertValidSchema(schema);
  const abortObj = Object.freeze({});
  const errors = [];
  const context = new ValidationContext(schema, documentAST, typeInfo, (error) => {
    if (errors.length >= maxErrors) {
      errors.push(new GraphQLError("Too many validation errors, error limit reached. Validation aborted."));
      throw abortObj;
    }
    errors.push(error);
  });
  const visitor = visitInParallel(rules.map((rule) => rule(context)));
  try {
    visit(documentAST, visitWithTypeInfo(typeInfo, visitor));
  } catch (e) {
    if (e !== abortObj) {
      throw e;
    }
  }
  return errors;
}
function validateSDL(documentAST, schemaToExtend, rules = specifiedSDLRules) {
  const errors = [];
  const context = new SDLValidationContext(documentAST, schemaToExtend, (error) => {
    errors.push(error);
  });
  const visitors = rules.map((rule) => rule(context));
  visit(documentAST, visitInParallel(visitors));
  return errors;
}
function assertValidSDL(documentAST) {
  const errors = validateSDL(documentAST);
  if (errors.length !== 0) {
    throw new Error(errors.map((error) => error.message).join(`

`));
  }
}
// node_modules/graphql/utilities/extendSchema.mjs
function extendSchemaImpl(schemaConfig, documentAST, options) {
  var _schemaDef, _schemaDef$descriptio, _schemaDef2, _options$assumeValid;
  const typeDefs = [];
  const typeExtensionsMap = Object.create(null);
  const directiveDefs = [];
  let schemaDef;
  const schemaExtensions = [];
  for (const def of documentAST.definitions) {
    if (def.kind === Kind.SCHEMA_DEFINITION) {
      schemaDef = def;
    } else if (def.kind === Kind.SCHEMA_EXTENSION) {
      schemaExtensions.push(def);
    } else if (isTypeDefinitionNode(def)) {
      typeDefs.push(def);
    } else if (isTypeExtensionNode(def)) {
      const extendedTypeName = def.name.value;
      const existingTypeExtensions = typeExtensionsMap[extendedTypeName];
      typeExtensionsMap[extendedTypeName] = existingTypeExtensions ? existingTypeExtensions.concat([def]) : [def];
    } else if (def.kind === Kind.DIRECTIVE_DEFINITION) {
      directiveDefs.push(def);
    }
  }
  if (Object.keys(typeExtensionsMap).length === 0 && typeDefs.length === 0 && directiveDefs.length === 0 && schemaExtensions.length === 0 && schemaDef == null) {
    return schemaConfig;
  }
  const typeMap = Object.create(null);
  for (const existingType of schemaConfig.types) {
    typeMap[existingType.name] = extendNamedType(existingType);
  }
  for (const typeNode of typeDefs) {
    var _stdTypeMap$name;
    const name = typeNode.name.value;
    typeMap[name] = (_stdTypeMap$name = stdTypeMap[name]) !== null && _stdTypeMap$name !== undefined ? _stdTypeMap$name : buildType(typeNode);
  }
  const operationTypes = {
    query: schemaConfig.query && replaceNamedType(schemaConfig.query),
    mutation: schemaConfig.mutation && replaceNamedType(schemaConfig.mutation),
    subscription: schemaConfig.subscription && replaceNamedType(schemaConfig.subscription),
    ...schemaDef && getOperationTypes([schemaDef]),
    ...getOperationTypes(schemaExtensions)
  };
  return {
    description: (_schemaDef = schemaDef) === null || _schemaDef === undefined ? undefined : (_schemaDef$descriptio = _schemaDef.description) === null || _schemaDef$descriptio === undefined ? undefined : _schemaDef$descriptio.value,
    ...operationTypes,
    types: Object.values(typeMap),
    directives: [
      ...schemaConfig.directives.map(replaceDirective),
      ...directiveDefs.map(buildDirective)
    ],
    extensions: Object.create(null),
    astNode: (_schemaDef2 = schemaDef) !== null && _schemaDef2 !== undefined ? _schemaDef2 : schemaConfig.astNode,
    extensionASTNodes: schemaConfig.extensionASTNodes.concat(schemaExtensions),
    assumeValid: (_options$assumeValid = options === null || options === undefined ? undefined : options.assumeValid) !== null && _options$assumeValid !== undefined ? _options$assumeValid : false
  };
  function replaceType(type) {
    if (isListType(type)) {
      return new GraphQLList(replaceType(type.ofType));
    }
    if (isNonNullType(type)) {
      return new GraphQLNonNull(replaceType(type.ofType));
    }
    return replaceNamedType(type);
  }
  function replaceNamedType(type) {
    return typeMap[type.name];
  }
  function replaceDirective(directive) {
    const config = directive.toConfig();
    return new GraphQLDirective({
      ...config,
      args: mapValue(config.args, extendArg)
    });
  }
  function extendNamedType(type) {
    if (isIntrospectionType(type) || isSpecifiedScalarType(type)) {
      return type;
    }
    if (isScalarType(type)) {
      return extendScalarType(type);
    }
    if (isObjectType(type)) {
      return extendObjectType(type);
    }
    if (isInterfaceType(type)) {
      return extendInterfaceType(type);
    }
    if (isUnionType(type)) {
      return extendUnionType(type);
    }
    if (isEnumType(type)) {
      return extendEnumType(type);
    }
    if (isInputObjectType(type)) {
      return extendInputObjectType(type);
    }
    invariant(false, "Unexpected type: " + inspect(type));
  }
  function extendInputObjectType(type) {
    var _typeExtensionsMap$co;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$co = typeExtensionsMap[config.name]) !== null && _typeExtensionsMap$co !== undefined ? _typeExtensionsMap$co : [];
    return new GraphQLInputObjectType({
      ...config,
      fields: () => ({
        ...mapValue(config.fields, (field) => ({
          ...field,
          type: replaceType(field.type)
        })),
        ...buildInputFieldMap(extensions)
      }),
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendEnumType(type) {
    var _typeExtensionsMap$ty;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$ty = typeExtensionsMap[type.name]) !== null && _typeExtensionsMap$ty !== undefined ? _typeExtensionsMap$ty : [];
    return new GraphQLEnumType({
      ...config,
      values: { ...config.values, ...buildEnumValueMap(extensions) },
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendScalarType(type) {
    var _typeExtensionsMap$co2;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$co2 = typeExtensionsMap[config.name]) !== null && _typeExtensionsMap$co2 !== undefined ? _typeExtensionsMap$co2 : [];
    let specifiedByURL = config.specifiedByURL;
    for (const extensionNode of extensions) {
      var _getSpecifiedByURL;
      specifiedByURL = (_getSpecifiedByURL = getSpecifiedByURL(extensionNode)) !== null && _getSpecifiedByURL !== undefined ? _getSpecifiedByURL : specifiedByURL;
    }
    return new GraphQLScalarType({
      ...config,
      specifiedByURL,
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendObjectType(type) {
    var _typeExtensionsMap$co3;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$co3 = typeExtensionsMap[config.name]) !== null && _typeExtensionsMap$co3 !== undefined ? _typeExtensionsMap$co3 : [];
    return new GraphQLObjectType({
      ...config,
      interfaces: () => [
        ...type.getInterfaces().map(replaceNamedType),
        ...buildInterfaces(extensions)
      ],
      fields: () => ({
        ...mapValue(config.fields, extendField),
        ...buildFieldMap(extensions)
      }),
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendInterfaceType(type) {
    var _typeExtensionsMap$co4;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$co4 = typeExtensionsMap[config.name]) !== null && _typeExtensionsMap$co4 !== undefined ? _typeExtensionsMap$co4 : [];
    return new GraphQLInterfaceType({
      ...config,
      interfaces: () => [
        ...type.getInterfaces().map(replaceNamedType),
        ...buildInterfaces(extensions)
      ],
      fields: () => ({
        ...mapValue(config.fields, extendField),
        ...buildFieldMap(extensions)
      }),
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendUnionType(type) {
    var _typeExtensionsMap$co5;
    const config = type.toConfig();
    const extensions = (_typeExtensionsMap$co5 = typeExtensionsMap[config.name]) !== null && _typeExtensionsMap$co5 !== undefined ? _typeExtensionsMap$co5 : [];
    return new GraphQLUnionType({
      ...config,
      types: () => [
        ...type.getTypes().map(replaceNamedType),
        ...buildUnionTypes(extensions)
      ],
      extensionASTNodes: config.extensionASTNodes.concat(extensions)
    });
  }
  function extendField(field) {
    return {
      ...field,
      type: replaceType(field.type),
      args: field.args && mapValue(field.args, extendArg)
    };
  }
  function extendArg(arg) {
    return { ...arg, type: replaceType(arg.type) };
  }
  function getOperationTypes(nodes) {
    const opTypes = {};
    for (const node of nodes) {
      var _node$operationTypes;
      const operationTypesNodes = (_node$operationTypes = node.operationTypes) !== null && _node$operationTypes !== undefined ? _node$operationTypes : [];
      for (const operationType of operationTypesNodes) {
        opTypes[operationType.operation] = getNamedType(operationType.type);
      }
    }
    return opTypes;
  }
  function getNamedType(node) {
    var _stdTypeMap$name2;
    const name = node.name.value;
    const type = (_stdTypeMap$name2 = stdTypeMap[name]) !== null && _stdTypeMap$name2 !== undefined ? _stdTypeMap$name2 : typeMap[name];
    if (type === undefined) {
      throw new Error(`Unknown type: "${name}".`);
    }
    return type;
  }
  function getWrappedType(node) {
    if (node.kind === Kind.LIST_TYPE) {
      return new GraphQLList(getWrappedType(node.type));
    }
    if (node.kind === Kind.NON_NULL_TYPE) {
      return new GraphQLNonNull(getWrappedType(node.type));
    }
    return getNamedType(node);
  }
  function buildDirective(node) {
    var _node$description;
    return new GraphQLDirective({
      name: node.name.value,
      description: (_node$description = node.description) === null || _node$description === undefined ? undefined : _node$description.value,
      locations: node.locations.map(({ value }) => value),
      isRepeatable: node.repeatable,
      args: buildArgumentMap(node.arguments),
      astNode: node
    });
  }
  function buildFieldMap(nodes) {
    const fieldConfigMap = Object.create(null);
    for (const node of nodes) {
      var _node$fields;
      const nodeFields = (_node$fields = node.fields) !== null && _node$fields !== undefined ? _node$fields : [];
      for (const field of nodeFields) {
        var _field$description;
        fieldConfigMap[field.name.value] = {
          type: getWrappedType(field.type),
          description: (_field$description = field.description) === null || _field$description === undefined ? undefined : _field$description.value,
          args: buildArgumentMap(field.arguments),
          deprecationReason: getDeprecationReason(field),
          astNode: field
        };
      }
    }
    return fieldConfigMap;
  }
  function buildArgumentMap(args) {
    const argsNodes = args !== null && args !== undefined ? args : [];
    const argConfigMap = Object.create(null);
    for (const arg of argsNodes) {
      var _arg$description;
      const type = getWrappedType(arg.type);
      argConfigMap[arg.name.value] = {
        type,
        description: (_arg$description = arg.description) === null || _arg$description === undefined ? undefined : _arg$description.value,
        defaultValue: valueFromAST(arg.defaultValue, type),
        deprecationReason: getDeprecationReason(arg),
        astNode: arg
      };
    }
    return argConfigMap;
  }
  function buildInputFieldMap(nodes) {
    const inputFieldMap = Object.create(null);
    for (const node of nodes) {
      var _node$fields2;
      const fieldsNodes = (_node$fields2 = node.fields) !== null && _node$fields2 !== undefined ? _node$fields2 : [];
      for (const field of fieldsNodes) {
        var _field$description2;
        const type = getWrappedType(field.type);
        inputFieldMap[field.name.value] = {
          type,
          description: (_field$description2 = field.description) === null || _field$description2 === undefined ? undefined : _field$description2.value,
          defaultValue: valueFromAST(field.defaultValue, type),
          deprecationReason: getDeprecationReason(field),
          astNode: field
        };
      }
    }
    return inputFieldMap;
  }
  function buildEnumValueMap(nodes) {
    const enumValueMap = Object.create(null);
    for (const node of nodes) {
      var _node$values;
      const valuesNodes = (_node$values = node.values) !== null && _node$values !== undefined ? _node$values : [];
      for (const value of valuesNodes) {
        var _value$description;
        enumValueMap[value.name.value] = {
          description: (_value$description = value.description) === null || _value$description === undefined ? undefined : _value$description.value,
          deprecationReason: getDeprecationReason(value),
          astNode: value
        };
      }
    }
    return enumValueMap;
  }
  function buildInterfaces(nodes) {
    return nodes.flatMap((node) => {
      var _node$interfaces$map, _node$interfaces;
      return (_node$interfaces$map = (_node$interfaces = node.interfaces) === null || _node$interfaces === undefined ? undefined : _node$interfaces.map(getNamedType)) !== null && _node$interfaces$map !== undefined ? _node$interfaces$map : [];
    });
  }
  function buildUnionTypes(nodes) {
    return nodes.flatMap((node) => {
      var _node$types$map, _node$types;
      return (_node$types$map = (_node$types = node.types) === null || _node$types === undefined ? undefined : _node$types.map(getNamedType)) !== null && _node$types$map !== undefined ? _node$types$map : [];
    });
  }
  function buildType(astNode) {
    var _typeExtensionsMap$na;
    const name = astNode.name.value;
    const extensionASTNodes = (_typeExtensionsMap$na = typeExtensionsMap[name]) !== null && _typeExtensionsMap$na !== undefined ? _typeExtensionsMap$na : [];
    switch (astNode.kind) {
      case Kind.OBJECT_TYPE_DEFINITION: {
        var _astNode$description;
        const allNodes = [astNode, ...extensionASTNodes];
        return new GraphQLObjectType({
          name,
          description: (_astNode$description = astNode.description) === null || _astNode$description === undefined ? undefined : _astNode$description.value,
          interfaces: () => buildInterfaces(allNodes),
          fields: () => buildFieldMap(allNodes),
          astNode,
          extensionASTNodes
        });
      }
      case Kind.INTERFACE_TYPE_DEFINITION: {
        var _astNode$description2;
        const allNodes = [astNode, ...extensionASTNodes];
        return new GraphQLInterfaceType({
          name,
          description: (_astNode$description2 = astNode.description) === null || _astNode$description2 === undefined ? undefined : _astNode$description2.value,
          interfaces: () => buildInterfaces(allNodes),
          fields: () => buildFieldMap(allNodes),
          astNode,
          extensionASTNodes
        });
      }
      case Kind.ENUM_TYPE_DEFINITION: {
        var _astNode$description3;
        const allNodes = [astNode, ...extensionASTNodes];
        return new GraphQLEnumType({
          name,
          description: (_astNode$description3 = astNode.description) === null || _astNode$description3 === undefined ? undefined : _astNode$description3.value,
          values: buildEnumValueMap(allNodes),
          astNode,
          extensionASTNodes
        });
      }
      case Kind.UNION_TYPE_DEFINITION: {
        var _astNode$description4;
        const allNodes = [astNode, ...extensionASTNodes];
        return new GraphQLUnionType({
          name,
          description: (_astNode$description4 = astNode.description) === null || _astNode$description4 === undefined ? undefined : _astNode$description4.value,
          types: () => buildUnionTypes(allNodes),
          astNode,
          extensionASTNodes
        });
      }
      case Kind.SCALAR_TYPE_DEFINITION: {
        var _astNode$description5;
        return new GraphQLScalarType({
          name,
          description: (_astNode$description5 = astNode.description) === null || _astNode$description5 === undefined ? undefined : _astNode$description5.value,
          specifiedByURL: getSpecifiedByURL(astNode),
          astNode,
          extensionASTNodes
        });
      }
      case Kind.INPUT_OBJECT_TYPE_DEFINITION: {
        var _astNode$description6;
        const allNodes = [astNode, ...extensionASTNodes];
        return new GraphQLInputObjectType({
          name,
          description: (_astNode$description6 = astNode.description) === null || _astNode$description6 === undefined ? undefined : _astNode$description6.value,
          fields: () => buildInputFieldMap(allNodes),
          astNode,
          extensionASTNodes,
          isOneOf: isOneOf(astNode)
        });
      }
    }
  }
}
var stdTypeMap = keyMap([...specifiedScalarTypes, ...introspectionTypes], (type) => type.name);
function getDeprecationReason(node) {
  const deprecated = getDirectiveValues(GraphQLDeprecatedDirective, node);
  return deprecated === null || deprecated === undefined ? undefined : deprecated.reason;
}
function getSpecifiedByURL(node) {
  const specifiedBy = getDirectiveValues(GraphQLSpecifiedByDirective, node);
  return specifiedBy === null || specifiedBy === undefined ? undefined : specifiedBy.url;
}
function isOneOf(node) {
  return Boolean(getDirectiveValues(GraphQLOneOfDirective, node));
}

// node_modules/graphql/utilities/buildASTSchema.mjs
function buildASTSchema(documentAST, options) {
  documentAST != null && documentAST.kind === Kind.DOCUMENT || devAssert(false, "Must provide valid Document AST.");
  if ((options === null || options === undefined ? undefined : options.assumeValid) !== true && (options === null || options === undefined ? undefined : options.assumeValidSDL) !== true) {
    assertValidSDL(documentAST);
  }
  const emptySchemaConfig = {
    description: undefined,
    types: [],
    directives: [],
    extensions: Object.create(null),
    extensionASTNodes: [],
    assumeValid: false
  };
  const config = extendSchemaImpl(emptySchemaConfig, documentAST, options);
  if (config.astNode == null) {
    for (const type of config.types) {
      switch (type.name) {
        case "Query":
          config.query = type;
          break;
        case "Mutation":
          config.mutation = type;
          break;
        case "Subscription":
          config.subscription = type;
          break;
      }
    }
  }
  const directives = [
    ...config.directives,
    ...specifiedDirectives.filter((stdDirective) => config.directives.every((directive) => directive.name !== stdDirective.name))
  ];
  return new GraphQLSchema({ ...config, directives });
}
function buildSchema(source, options) {
  const document = parse(source, {
    noLocation: options === null || options === undefined ? undefined : options.noLocation,
    allowLegacyFragmentVariables: options === null || options === undefined ? undefined : options.allowLegacyFragmentVariables
  });
  return buildASTSchema(document, {
    assumeValidSDL: options === null || options === undefined ? undefined : options.assumeValidSDL,
    assumeValid: options === null || options === undefined ? undefined : options.assumeValid
  });
}
// src/identity/attribution.ts
function attributionTargets(schema) {
  const targets = new Map;
  const mutation = schema.getMutationType();
  if (!mutation)
    return targets;
  for (const field of Object.values(mutation.getFields())) {
    if (field.args.some((arg) => arg.name === "createAsUser")) {
      targets.set(field.name, { field: field.name, inputArg: "createAsUser", kind: "argument" });
      continue;
    }
    for (const arg of field.args) {
      const named = getNamedType(arg.type);
      if (isInputObjectType(named) && "createAsUser" in named.getFields()) {
        targets.set(field.name, { field: field.name, inputArg: arg.name });
        break;
      }
    }
  }
  return targets;
}
function rejectForeignAuthor(field, supplied, author) {
  if (supplied === undefined || supplied === author)
    return;
  throw new Error(author === null ? `${field}: createAsUser "${String(supplied)}" is not allowed: the main session writes as the application; omit it` : `${field}: createAsUser "${String(supplied)}" conflicts with the session author "${author}"; omit it`);
}
function attributeTypedArgs(args, target, author) {
  if (target.kind === "argument") {
    rejectForeignAuthor(target.field, args.createAsUser, author);
    return author === null ? args : { ...args, createAsUser: author };
  }
  const input = args[target.inputArg];
  if (input === undefined) {
    if (author === null)
      return args;
    throw new Error(`${target.field}: argument "${target.inputArg}" is required for actor=app attribution`);
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error(`${target.field}: argument "${target.inputArg}" must be an object`);
  }
  rejectForeignAuthor(target.field, input.createAsUser, author);
  return author === null ? args : { ...args, [target.inputArg]: { ...input, createAsUser: author } };
}

// src/schema/catalog.ts
import * as fs from "fs";
import * as path from "path";
function packageRoot() {
  for (let dir = import.meta.dir;; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "generated", "catalog.json")))
      return dir;
    if (dir === path.dirname(dir))
      throw new Error(`generated/catalog.json not found above ${import.meta.dir}`);
  }
}
var ROOT = packageRoot();
var catalogCache;
var schemaCache;
function loadCatalog() {
  if (!catalogCache) {
    const raw = fs.readFileSync(path.join(ROOT, "generated", "catalog.json"), "utf8");
    catalogCache = JSON.parse(raw);
  }
  return catalogCache;
}
function getSchema() {
  if (!schemaCache)
    schemaCache = buildSchema(fs.readFileSync(path.join(ROOT, "schema", "linear.schema.graphql"), "utf8"));
  return schemaCache;
}
function rootField(schema, descriptor) {
  const rootType = descriptor.kind === "Query" ? schema.getQueryType() : schema.getMutationType();
  const field = rootType?.getFields()[descriptor.root];
  if (!field)
    throw new Error(`${descriptor.tool}: ${descriptor.kind}.${descriptor.root} is not part of the pinned schema`);
  return field;
}
function selectableWithoutArgs(field) {
  return field.args.every((arg) => !isNonNullType(arg.type) || arg.defaultValue !== undefined);
}
function leafFieldNames(type) {
  if (!isObjectType(type) && !isInterfaceType(type))
    return [];
  return Object.values(type.getFields()).filter((field) => !field.deprecationReason && selectableWithoutArgs(field)).filter((field) => {
    const named = getNamedType(field.type);
    return isScalarType(named) || isEnumType(named);
  }).map((field) => field.name);
}
function defaultSelection(type, depth) {
  if (isUnionType(type)) {
    const members = type.getTypes().map((member) => `... on ${member.name} { ${leafFieldNames(member).join(" ") || "__typename"} }`);
    return `{ __typename ${members.join(" ")} }`;
  }
  if (!isObjectType(type) && !isInterfaceType(type))
    return "";
  const fields = type.getFields();
  const nodes = fields.nodes;
  if (nodes && selectableWithoutArgs(nodes)) {
    const nodeSelection = defaultSelection(getNamedType(nodes.type), depth - 1) || "";
    const pageInfo = fields.pageInfo ? " pageInfo { hasNextPage endCursor }" : "";
    return `{ nodes ${nodeSelection}${pageInfo} }`.replace("nodes  ", "nodes ");
  }
  const parts = isInterfaceType(type) ? ["__typename"] : [];
  for (const field of Object.values(fields)) {
    if (field.deprecationReason || !selectableWithoutArgs(field))
      continue;
    const named = getNamedType(field.type);
    if (isScalarType(named) || isEnumType(named)) {
      parts.push(field.name);
      continue;
    }
    if (depth <= 0)
      continue;
    if (isObjectType(named) || isInterfaceType(named)) {
      if (named.getFields().nodes)
        continue;
      const identifying = ["id", "name"].filter((candidate) => named.getFields()[candidate]);
      if (identifying.length)
        parts.push(`${field.name} { ${identifying.join(" ")} }`);
    }
  }
  if (!parts.length)
    parts.push("__typename");
  return `{ ${parts.join(" ")} }`;
}
function parseSelection(raw, label) {
  let parsed;
  try {
    parsed = parse(raw);
  } catch {
    try {
      parsed = parse(`{ ${raw} }`);
    } catch (error) {
      throw new Error(`${label}: invalid selection: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  const operations = parsed.definitions.filter((d) => d.kind === Kind.OPERATION_DEFINITION);
  const fragments = parsed.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION);
  if (operations.length + fragments.length !== parsed.definitions.length) {
    throw new Error(`${label}: invalid selection: only a selection set and fragment definitions are allowed`);
  }
  if (operations.length !== 1) {
    throw new Error(`${label}: invalid selection: expected exactly one selection set, found ${operations.length}`);
  }
  const operation = operations[0];
  if (operation.operation !== OperationTypeNode.QUERY || operation.name || operation.variableDefinitions?.length || operation.directives?.length) {
    throw new Error(`${label}: invalid selection: expected a bare selection set such as \`{ id title }\``);
  }
  if (!operation.selectionSet.selections.length)
    throw new Error(`${label}: invalid selection: the selection set is empty`);
  return { selectionSet: operation.selectionSet, fragments };
}
function composeOperation(descriptor, args, selection) {
  const schema = getSchema();
  const field = rootField(schema, descriptor);
  const variables = {};
  const variableDefinitions = [];
  const argumentNodes = [];
  for (const arg of field.args) {
    if (!(arg.name in args) || args[arg.name] === undefined) {
      if (isNonNullType(arg.type) && arg.defaultValue === undefined) {
        throw new Error(`${descriptor.tool}: missing required argument "${arg.name}" of type ${String(arg.type)}`);
      }
      continue;
    }
    variables[arg.name] = args[arg.name];
    const variable = { kind: Kind.VARIABLE, name: { kind: Kind.NAME, value: arg.name } };
    variableDefinitions.push({ kind: Kind.VARIABLE_DEFINITION, variable, type: parseType(String(arg.type)) });
    argumentNodes.push({ kind: Kind.ARGUMENT, name: { kind: Kind.NAME, value: arg.name }, value: variable });
  }
  const named = getNamedType(field.type);
  const composite = isObjectType(named) || isInterfaceType(named) || isUnionType(named);
  const requested = (selection ?? (typeof args.selection === "string" ? args.selection : undefined))?.trim();
  if (requested && !composite) {
    throw new Error(`${descriptor.tool}: ${descriptor.root} returns the leaf type ${named.name}; it takes no selection set`);
  }
  const parsedSelection = composite ? parseSelection(requested || defaultSelection(named, 2), descriptor.tool) : null;
  const rootFieldNode = {
    kind: Kind.FIELD,
    name: { kind: Kind.NAME, value: descriptor.root },
    ...argumentNodes.length ? { arguments: argumentNodes } : {},
    ...parsedSelection ? { selectionSet: parsedSelection.selectionSet } : {}
  };
  const operation = {
    kind: Kind.OPERATION_DEFINITION,
    operation: descriptor.kind === "Query" ? OperationTypeNode.QUERY : OperationTypeNode.MUTATION,
    name: { kind: Kind.NAME, value: descriptor.tool },
    ...variableDefinitions.length ? { variableDefinitions } : {},
    selectionSet: { kind: Kind.SELECTION_SET, selections: [rootFieldNode] }
  };
  const document = print({ kind: Kind.DOCUMENT, definitions: [operation, ...parsedSelection?.fragments ?? []] });
  composeSelectionValidation(document, descriptor.tool);
  return { document, variables };
}
function describeField(field, descriptor) {
  const lines = [`${descriptor.tool} \u2014 ${descriptor.kind}.${descriptor.root}: ${String(field.type)}`];
  if (descriptor.deprecated)
    lines.push(`DEPRECATED: ${descriptor.deprecated}`);
  if (descriptor.description)
    lines.push(descriptor.description.trim());
  lines.push(field.args.length ? "Arguments:" : "Arguments: none");
  for (const arg of field.args) {
    const parts = [`  ${arg.name}: ${String(arg.type)}`];
    if (arg.defaultValue !== undefined)
      parts.push(`(default ${JSON.stringify(arg.defaultValue)})`);
    if (arg.description)
      parts.push(`\u2014 ${arg.description.replace(/\s+/g, " ").trim()}`);
    lines.push(parts.join(" "));
  }
  const named = getNamedType(field.type);
  if (isObjectType(named) || isInterfaceType(named)) {
    const fields = Object.values(named.getFields()).map((f) => `${f.name}: ${String(f.type)}${f.deprecationReason ? " [deprecated]" : ""}`);
    lines.push(`Returns ${named.name} with fields:`);
    lines.push(`  ${fields.join(", ")}`);
  } else if (isUnionType(named)) {
    lines.push(`Returns union ${named.name}: ${named.getTypes().map((t) => t.name).join(" | ")}`);
  } else {
    lines.push(`Returns leaf type ${named.name}; no selection set is used.`);
  }
  lines.push("Selection: optional GraphQL selection set override; omitted means the default scalar-first selection.");
  return lines.join(`
`);
}
function describeType(type) {
  const header = `${type.name}${type.description ? ` \u2014 ${type.description.replace(/\s+/g, " ").trim()}` : ""}`;
  if (isEnumType(type)) {
    const values = type.getValues().map((v) => `  ${v.name}${v.deprecationReason ? ` [deprecated: ${v.deprecationReason}]` : ""}`);
    return [`enum ${header}`, ...values].join(`
`);
  }
  if (isUnionType(type))
    return [`union ${header}`, `  ${type.getTypes().map((t) => t.name).join(" | ")}`].join(`
`);
  if (isScalarType(type))
    return `scalar ${header}`;
  if (isInputObjectType(type)) {
    const fields = Object.values(type.getFields()).map((f) => {
      const suffix = f.defaultValue !== undefined ? ` (default ${JSON.stringify(f.defaultValue)})` : "";
      return `  ${f.name}: ${String(f.type)}${suffix}${f.deprecationReason ? ` [deprecated: ${f.deprecationReason}]` : ""}`;
    });
    return [`input ${header}`, ...fields].join(`
`);
  }
  const kind = isInterfaceType(type) ? "interface" : "type";
  const fields = Object.values(type.getFields()).map((f) => {
    const args = f.args.length ? `(${f.args.map((a) => `${a.name}: ${String(a.type)}`).join(", ")})` : "";
    return `  ${f.name}${args}: ${String(f.type)}${f.deprecationReason ? ` [deprecated: ${f.deprecationReason}]` : ""}`;
  });
  return [`${kind} ${header}`, ...fields].join(`
`);
}
function distance(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1;i <= a.length; i++) {
    const current = [i];
    for (let j = 1;j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}
function suggestions(name) {
  const candidates = new Set;
  for (const descriptor of loadCatalog()) {
    candidates.add(descriptor.tool);
    candidates.add(descriptor.root);
  }
  for (const type of Object.values(getSchema().getTypeMap()))
    if (!type.name.startsWith("__"))
      candidates.add(type.name);
  const needle = name.toLowerCase();
  return [...candidates].map((candidate) => ({ candidate, score: distance(needle, candidate.toLowerCase()) })).filter((entry) => entry.score <= Math.max(3, Math.floor(needle.length / 2)) || entry.candidate.toLowerCase().includes(needle)).sort((a, b) => a.score !== b.score ? a.score - b.score : a.candidate < b.candidate ? -1 : 1).slice(0, 8).map((entry) => entry.candidate);
}
function describe(name) {
  const schema = getSchema();
  const matches = loadCatalog().filter((d) => d.tool === name || d.root === name);
  const sections = matches.map((descriptor) => describeField(rootField(schema, descriptor), descriptor));
  const type = schema.getType(name);
  if (type)
    sections.push(describeType(type));
  if (sections.length)
    return sections.join(`

`);
  const close = suggestions(name);
  return `unknown name "${name}"${close.length ? `; did you mean: ${close.join(", ")}` : ""}`;
}

// src/schema/raw.ts
function composeSelectionValidation(document, label) {
  let parsed;
  try {
    parsed = parse(document);
  } catch (error) {
    throw new Error(`${label}: invalid selection: ${error instanceof Error ? error.message : String(error)}`);
  }
  const errors = validate(getSchema(), parsed);
  if (errors.length)
    throw new Error(`${label}: invalid operation: ${errors.map((e) => e.message).join("; ")}`);
  return parsed;
}
function parseDocument(document) {
  try {
    return parse(document);
  } catch (error) {
    throw new Error(`invalid GraphQL document: ${error instanceof Error ? error.message : String(error)}`);
  }
}
function selectOperation(parsed, operationName) {
  const operations = parsed.definitions.filter((d) => d.kind === Kind.OPERATION_DEFINITION);
  if (!operations.length)
    throw new Error("document contains no operation");
  if (operations.length > 1 && !operationName) {
    const names = operations.map((op) => op.name?.value ?? "<anonymous>").join(", ");
    throw new Error(`document defines ${operations.length} operations (${names}); operationName is required`);
  }
  const selected = operationName ? operations.find((op) => op.name?.value === operationName) : operations[0];
  if (!selected)
    throw new Error(`unknown operationName "${operationName}"`);
  return selected;
}
function fragmentsOf(parsed) {
  return new Map(parsed.definitions.filter((d) => d.kind === Kind.FRAGMENT_DEFINITION).map((definition) => [definition.name.value, definition]));
}
function rootFields(selectionSet, fragments, seen = new Set) {
  const found = [];
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      found.push(selection);
      continue;
    }
    if (selection.kind === Kind.INLINE_FRAGMENT) {
      found.push(...rootFields(selection.selectionSet, fragments, seen));
      continue;
    }
    const name = selection.name.value;
    if (seen.has(name))
      continue;
    const fragment = fragments.get(name);
    if (!fragment)
      throw new Error(`unknown fragment "${name}"`);
    seen.add(name);
    found.push(...rootFields(fragment.selectionSet, fragments, seen));
  }
  return found;
}
function mutationRootsOf(operation, fragments) {
  if (operation.operation !== "mutation")
    return [];
  const roots = [];
  for (const field of rootFields(operation.selectionSet, fragments)) {
    const alias = field.alias?.value ?? field.name.value;
    if (!roots.some((root) => root.alias === alias))
      roots.push({ alias, field: field.name.value });
  }
  return roots;
}
var DRIFT = {
  field: /^Cannot query field "([^"]+)" on type "([^"]+)"\./,
  argument: /^Unknown argument "([^"]+)" on field "([^"]+)"\./,
  type: /^Unknown type "([^"]+)"\./,
  inputField: /^Field "([^"]+)" is not defined by type "([^"]+)"\./,
  enumValue: /^Value "([^"]+)" does not exist in "([^"]+)" enum\./,
  variablePosition: /^Variable "\$[^"]+" of type "([^"]+)" used in position expecting type/,
  requiredArgument: /^Field "([^"]+)" argument "([^"]+)" of type .* is required, but it was not provided\./
};
function partitionErrors(messages) {
  const unpinned = { fields: [], arguments: [], types: [], inputFields: [] };
  const push = (bucket, value) => {
    if (!bucket.includes(value))
      bucket.push(value);
  };
  const rest = [];
  for (const message of messages) {
    const field = DRIFT.field.exec(message);
    if (field) {
      push(unpinned.fields, `${field[2]}.${field[1]}`);
      continue;
    }
    const argument = DRIFT.argument.exec(message);
    if (argument) {
      push(unpinned.arguments, `${argument[2]}(${argument[1]})`);
      continue;
    }
    const type = DRIFT.type.exec(message);
    if (type) {
      push(unpinned.types, type[1]);
      continue;
    }
    const inputField = DRIFT.inputField.exec(message);
    if (inputField) {
      push(unpinned.inputFields, `${inputField[2]}.${inputField[1]}`);
      continue;
    }
    const enumValue = DRIFT.enumValue.exec(message);
    if (enumValue) {
      push(unpinned.inputFields, `${enumValue[2]}.${enumValue[1]}`);
      continue;
    }
    rest.push(message);
  }
  const unknownFieldNames = new Set(unpinned.fields.map((path) => path.slice(path.indexOf(".") + 1)));
  const hard = [];
  for (const message of rest) {
    const position = DRIFT.variablePosition.exec(message);
    if (position && unpinned.types.includes(position[1].replace(/[[\]!]/g, "")))
      continue;
    const required = DRIFT.requiredArgument.exec(message);
    if (required && unknownFieldNames.has(required[1]))
      continue;
    hard.push(message);
  }
  return { unpinned, hard };
}
function classifyRawDocument(document, operationName) {
  const parsed = parseDocument(document);
  const selected = selectOperation(parsed, operationName);
  if (selected.operation === "subscription")
    throw new Error("subscriptions are not supported");
  const { unpinned, hard } = partitionErrors(validate(getSchema(), parsed).map((error) => error.message));
  if (hard.length)
    throw new Error(`document does not validate against the pinned Linear schema: ${hard.join("; ")}`);
  const drifted = unpinned.fields.length + unpinned.arguments.length + unpinned.types.length + unpinned.inputFields.length;
  return {
    operation: selected.operation,
    tier: selected.operation === "mutation" ? "write" : "read",
    name: selected.name?.value ?? null,
    document,
    validation: drifted ? "unknown" : "pinned",
    unpinned,
    mutationRoots: mutationRootsOf(selected, fragmentsOf(parsed))
  };
}
function mutationPayloadRoots(document, operationName) {
  const parsed = parseDocument(document);
  return mutationRootsOf(selectOperation(parsed, operationName), fragmentsOf(parsed));
}
function withCreateAsUser(value, author, label) {
  if (Array.isArray(value))
    return value.map((entry) => withCreateAsUser(entry, author, label));
  if (value === null || typeof value !== "object")
    throw new Error(`${label}: input variable is not an object`);
  return { ...value, createAsUser: author };
}
function rejectSuppliedAuthors(targets, values) {
  for (const [node, target] of targets) {
    const label = `${node.alias?.value ?? node.name.value} (${node.name.value})`;
    const argument = node.arguments?.find((arg) => arg.name.value === target.inputArg);
    if (!argument)
      continue;
    const value = valueFromASTUntyped(argument.value, values);
    if (target.kind === "argument") {
      rejectForeignAuthor(label, value ?? undefined, null);
      continue;
    }
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== null && typeof entry === "object" && "createAsUser" in entry)
        rejectForeignAuthor(label, entry.createAsUser ?? undefined, null);
    }
  }
}
function injectCreateAsUser(document, variables, roots, author, operationName) {
  const parsed = parseDocument(document);
  const operation = selectOperation(parsed, operationName);
  const fragments = fragmentsOf(parsed);
  const byField = new Map(roots.map((root) => [root.field, root]));
  const targets = new Map;
  if (operation.operation === "mutation") {
    for (const field of rootFields(operation.selectionSet, fragments)) {
      const target = byField.get(field.name.value);
      if (target)
        targets.set(field, target);
    }
  }
  if (!targets.size)
    return { document, variables };
  const defaults = new Map((operation.variableDefinitions ?? []).map((definition) => [
    definition.variable.name.value,
    definition.defaultValue ? valueFromASTUntyped(definition.defaultValue) : undefined
  ]));
  if (author === null) {
    rejectSuppliedAuthors(targets, { ...Object.fromEntries(defaults), ...variables });
    return { document, variables };
  }
  const nextVariables = { ...variables };
  const transformed = visit(parsed, {
    Field: {
      enter(node) {
        const target = targets.get(node);
        if (!target)
          return;
        const inputArg = target.inputArg;
        const label = `${node.alias?.value ?? node.name.value} (${node.name.value})`;
        const argument = node.arguments?.find((arg) => arg.name.value === inputArg);
        if (target.kind === "argument") {
          if (argument?.value.kind === Kind.VARIABLE) {
            nextVariables[argument.value.name.value] = author;
            return;
          }
          const authored = {
            kind: Kind.ARGUMENT,
            name: { kind: Kind.NAME, value: inputArg },
            value: { kind: Kind.STRING, value: author }
          };
          const others = (node.arguments ?? []).filter((arg) => arg !== argument);
          return { ...node, arguments: [...others, authored] };
        }
        if (!argument)
          throw new Error(`${label}: missing "${inputArg}" argument, cannot attribute the author`);
        if (argument.value.kind === Kind.VARIABLE) {
          const name = argument.value.name.value;
          const current = nextVariables[name] ?? defaults.get(name);
          if (current === undefined)
            throw new Error(`${label}: variable "$${name}" has no value, cannot attribute the author`);
          nextVariables[name] = withCreateAsUser(current, author, label);
          return;
        }
        if (argument.value.kind !== Kind.OBJECT)
          throw new Error(`${label}: "${inputArg}" is not an object literal or variable`);
        const field = {
          kind: Kind.OBJECT_FIELD,
          name: { kind: Kind.NAME, value: "createAsUser" },
          value: { kind: Kind.STRING, value: author }
        };
        const fields = [...argument.value.fields.filter((existing) => existing.name.value !== "createAsUser"), field];
        const nextArgument = { ...argument, value: { ...argument.value, fields } };
        return { ...node, arguments: node.arguments?.map((arg) => arg === argument ? nextArgument : arg) };
      }
    }
  });
  return { document: print(transformed), variables: nextVariables };
}

// src/approval.ts
function typedApproval(descriptor) {
  return descriptor.kind === "Query" ? "read" : "write";
}
var rawApproval = (args) => {
  const input = args;
  if (!input || typeof input.document !== "string")
    return "write";
  try {
    const operationName = typeof input.operationName === "string" ? input.operationName : undefined;
    return classifyRawDocument(input.document, operationName).tier;
  } catch {
    return "write";
  }
};

// src/auth/key-file.ts
import * as fs2 from "fs";
import * as os from "os";
import * as path2 from "path";
function expandHome(file) {
  return file === "~" || file.startsWith("~/") ? path2.join(os.homedir(), file.slice(1)) : file;
}
var MAX_ENV_FILE_BYTES = 64 * 1024;
function readEnvKeys(file, keys, what) {
  const resolved = expandHome(file);
  let stat;
  try {
    stat = fs2.statSync(resolved);
  } catch {
    throw new Error(`${what} not found: ${resolved}`);
  }
  if (!stat.isFile())
    throw new Error(`${what} is not a regular file: ${resolved}`);
  if (stat.size > MAX_ENV_FILE_BYTES)
    throw new Error(`${what} is larger than ${MAX_ENV_FILE_BYTES} bytes: ${resolved}`);
  let content;
  try {
    content = fs2.readFileSync(resolved, "utf8");
  } catch {
    throw new Error(`${what} not found: ${resolved}`);
  }
  const found = new Map;
  for (const raw of content.split(`
`)) {
    const line = raw.trim().replace(/^export\s+/, "");
    const eq = line.indexOf("=");
    if (eq <= 0)
      continue;
    const value = line.slice(eq + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    const key = line.slice(0, eq).trim();
    if (value && !found.has(key))
      found.set(key, value);
  }
  const result = {};
  for (const key of keys) {
    const value = found.get(key);
    if (!value)
      throw new Error(`${key} is not set in ${resolved}`);
    result[key] = value;
  }
  return result;
}
function readApiKeyFile(file) {
  return readEnvKeys(file, ["LINEAR_API_KEY"], "Linear API key file").LINEAR_API_KEY;
}

// src/auth/oauth.ts
import { createHash, randomBytes as randomBytes2, randomUUID } from "crypto";
import { createServer } from "http";

// src/auth/store.ts
import { readFileSync as readFileSync3 } from "fs";
import { chmod, mkdir, open, readFile, rename, stat, unlink, utimes, writeFile } from "fs/promises";
import { dirname as dirname2, resolve } from "path";
import { hostname } from "os";
import { randomBytes } from "crypto";
var FILE_VERSION = 1;
var HEARTBEAT_MS = 1000;
var HEARTBEAT_STALE_MS = 5000;
var DEFAULT_LOCK_TIMEOUT_MS = 15000;
var LOCK_POLL_MS = 25;
function summarize(connection) {
  const { secret: _secret, ...rest } = connection;
  return { ...rest };
}
function isErrnoCode(error, code) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
function delay(ms) {
  return new Promise((done) => {
    const timer = setTimeout(done, ms);
    timer.unref?.();
  });
}
function validateConnection(value, index, filePath) {
  const where = `${filePath} entry ${index}`;
  if (typeof value !== "object" || value === null)
    throw new Error(`${where} is not an object`);
  const row = value;
  for (const field of ["id", "label", "createdAt"]) {
    if (typeof row[field] !== "string" || row[field] === "") {
      throw new Error(`${where} has a missing or non-string "${field}"`);
    }
  }
  if (row.workspace !== null && typeof row.workspace !== "string") {
    throw new Error(`${where} has an invalid "workspace"`);
  }
  const secret = row.secret;
  if (typeof secret !== "object" || secret === null)
    throw new Error(`${where} has no "secret"`);
  const secretRow = secret;
  if (row.kind === "oauth") {
    if (row.actor !== "user" && row.actor !== "app")
      throw new Error(`${where} has an invalid "actor"`);
    if (typeof secretRow.accessToken !== "string") {
      throw new Error(`${where} has no secret.accessToken`);
    }
    if (secretRow.refreshToken !== null && typeof secretRow.refreshToken !== "string") {
      throw new Error(`${where} has an invalid secret.refreshToken`);
    }
    if (secretRow.expiresAt !== null && typeof secretRow.expiresAt !== "number") {
      throw new Error(`${where} has an invalid secret.expiresAt`);
    }
    if (secretRow.scope !== null && typeof secretRow.scope !== "string") {
      throw new Error(`${where} has an invalid secret.scope`);
    }
  } else if (row.kind === "api_key") {
    if (row.actor !== "user")
      throw new Error(`${where} must have actor "user"`);
    if (typeof secretRow.apiKey !== "string")
      throw new Error(`${where} has no secret.apiKey`);
  } else {
    throw new Error(`${where} has an unknown "kind": ${JSON.stringify(row.kind)}`);
  }
  return value;
}
function parseFile(raw, filePath) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`credential store ${filePath} is not valid JSON and was left untouched: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (typeof parsed !== "object" || parsed === null || !("connections" in parsed)) {
    throw new Error(`credential store ${filePath} is malformed: missing "connections"`);
  }
  const connections = parsed.connections;
  if (!Array.isArray(connections)) {
    throw new Error(`credential store ${filePath} is malformed: "connections" is not an array`);
  }
  return connections.map((row, index) => validateConnection(row, index, filePath));
}
function readFileSyncSafe(filePath) {
  try {
    return parseFile(readFileSync3(filePath, "utf8"), filePath);
  } catch (error) {
    if (isErrnoCode(error, "ENOENT"))
      return [];
    throw error;
  }
}
async function readFileAsync(filePath) {
  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (isErrnoCode(error, "ENOENT"))
      return [];
    throw error;
  }
  return parseFile(raw, filePath);
}
async function writeConnections(filePath, connections) {
  const temp = `${filePath}.tmp-${randomBytes(6).toString("hex")}`;
  try {
    await writeFile(temp, `${JSON.stringify({ version: FILE_VERSION, connections }, null, 2)}
`, {
      mode: 384
    });
    await rename(temp, filePath);
  } catch (error) {
    await unlink(temp).catch(() => {});
    throw error;
  }
  await chmod(filePath, 384);
}
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !isErrnoCode(error, "ESRCH");
  }
}
async function readLockRecord(lockPath) {
  try {
    const parsed = JSON.parse(await readFile(lockPath, "utf8"));
    if (typeof parsed === "object" && parsed !== null && typeof parsed.pid === "number" && typeof parsed.hostname === "string" && typeof parsed.token === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
async function breakIfOwnerDead(lockPath) {
  let touchedAt;
  try {
    touchedAt = (await stat(lockPath)).mtimeMs;
  } catch {
    return false;
  }
  if (Date.now() - touchedAt <= HEARTBEAT_STALE_MS)
    return false;
  const record = await readLockRecord(lockPath);
  if (!record || record.hostname !== hostname())
    return false;
  if (isProcessAlive(record.pid))
    return false;
  await unlink(lockPath).catch(() => {});
  return true;
}
async function acquireLock(lockPath, timeoutMs) {
  const token = randomBytes(12).toString("hex");
  const record = {
    pid: process.pid,
    hostname: hostname(),
    token,
    createdAt: new Date().toISOString()
  };
  const deadline = Date.now() + timeoutMs;
  for (;; ) {
    try {
      const handle = await open(lockPath, "wx", 384);
      try {
        await handle.writeFile(JSON.stringify(record));
      } finally {
        await handle.close();
      }
      break;
    } catch (error) {
      if (!isErrnoCode(error, "EEXIST"))
        throw error;
    }
    if (await breakIfOwnerDead(lockPath))
      continue;
    if (Date.now() >= deadline) {
      throw new Error(`timed out acquiring ${lockPath} after ${timeoutMs}ms`);
    }
    await delay(LOCK_POLL_MS);
  }
  const heartbeat = setInterval(() => {
    const now = new Date;
    utimes(lockPath, now, now).catch(() => {});
  }, HEARTBEAT_MS);
  heartbeat.unref?.();
  return {
    token,
    async release() {
      clearInterval(heartbeat);
      const current = await readLockRecord(lockPath);
      if (current && current.token !== token)
        return;
      await unlink(lockPath).catch(() => {});
    }
  };
}
var queues = new Map;
function enqueue(key, fn) {
  const previous = queues.get(key) ?? Promise.resolve();
  const settled = previous.then(fn, fn);
  queues.set(key, settled.then(() => {
    return;
  }, () => {
    return;
  }));
  return settled;
}
function createCredentialStore(filePath, options = {}) {
  const absolute = resolve(filePath);
  const lockPath = `${absolute}.lock`;
  const lockTimeoutMs = options.lockTimeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS;
  async function transaction(fn) {
    return enqueue(absolute, async () => {
      await mkdir(dirname2(absolute), { recursive: true, mode: 448 });
      const lock = await acquireLock(lockPath, lockTimeoutMs);
      try {
        const connections = await readFileAsync(absolute);
        let dirty = false;
        const tx = {
          list: () => connections.map(summarize),
          get: (id) => connections.find((connection) => connection.id === id),
          upsert(connection) {
            const index = connections.findIndex((existing) => existing.id === connection.id);
            if (index === -1)
              connections.push(connection);
            else
              connections[index] = connection;
            dirty = true;
          },
          remove(id) {
            const index = connections.findIndex((connection) => connection.id === id);
            if (index === -1)
              return false;
            connections.splice(index, 1);
            dirty = true;
            return true;
          }
        };
        const result = await fn(tx);
        if (dirty)
          await writeConnections(absolute, connections);
        return result;
      } finally {
        await lock.release();
      }
    });
  }
  return {
    filePath,
    list: () => readFileSyncSafe(absolute).map(summarize),
    get: (id) => readFileSyncSafe(absolute).find((connection) => connection.id === id),
    upsert: (connection) => transaction((tx) => tx.upsert(connection)),
    remove: (id) => transaction((tx) => tx.remove(id)),
    transaction
  };
}
function authHeadersFor(connection) {
  return connection.kind === "oauth" ? { authorization: `Bearer ${connection.secret.accessToken}` } : { authorization: connection.secret.apiKey };
}

// src/client/graphql.ts
var DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
var MAX_MESSAGE_CHARS = 200;
var TOKEN_PATTERN = /lin_(?:api|oauth)_[A-Za-z0-9_-]+/g;
var BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
function numericHeader(headers, name) {
  const raw = headers.get(name);
  if (raw === null)
    return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}
function readRetryAfterMs(headers) {
  const raw = headers.get("retry-after");
  if (raw === null)
    return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds))
    return Math.max(0, Math.round(seconds * 1000));
  const at = Date.parse(raw);
  return Number.isFinite(at) ? Math.max(0, at - Date.now()) : null;
}
function redact(text, secrets) {
  let cleaned = text;
  for (const secret of secrets) {
    if (secret.length >= 8)
      cleaned = cleaned.split(secret).join("[redacted]");
  }
  return cleaned.replace(TOKEN_PATTERN, "[redacted]").replace(BEARER_PATTERN, "Bearer [redacted]");
}
function safeMessage(text, secrets) {
  const cleaned = redact(text, secrets);
  return cleaned.length > MAX_MESSAGE_CHARS ? `${cleaned.slice(0, MAX_MESSAGE_CHARS)}\u2026` : cleaned;
}
function readErrors(body, secrets) {
  if (typeof body !== "object" || body === null || !("errors" in body))
    return null;
  const raw = body.errors;
  if (!Array.isArray(raw) || raw.length === 0)
    return null;
  return raw.map((entry) => {
    const isObject = typeof entry === "object" && entry !== null;
    const rawMessage = isObject && "message" in entry ? entry.message : undefined;
    const message = typeof rawMessage === "string" ? rawMessage : JSON.stringify(entry);
    const rawPath = isObject && "path" in entry ? entry.path : undefined;
    const safe = redact(message, secrets);
    if (!Array.isArray(rawPath))
      return { message: safe };
    const path = rawPath.map((part) => typeof part === "number" ? part : redact(String(part), secrets));
    return { message: safe, path };
  });
}
function firstMessage(errors, fallback) {
  return errors && errors.length > 0 ? errors[0].message : fallback;
}
async function readBoundedBody(response, limit) {
  const body = response.body;
  if (body === null)
    return { tooLarge: false, text: "" };
  const reader = body.getReader();
  const chunks = [];
  let seen = 0;
  for (;; ) {
    const { done, value } = await reader.read();
    if (done)
      break;
    seen += value.byteLength;
    if (seen > limit) {
      await reader.cancel();
      return { tooLarge: true, seen };
    }
    chunks.push(value);
  }
  const joined = new Uint8Array(seen);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { tooLarge: false, text: new TextDecoder().decode(joined) };
}
function createLinearClient(options) {
  const doFetch = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 30000;
  return {
    async execute(document, variables, opts) {
      const callerSignal = opts?.signal;
      if (callerSignal?.aborted) {
        return {
          ok: false,
          kind: "aborted",
          outcome: "not_sent",
          status: null,
          message: "request aborted by caller before it was sent",
          errors: null,
          retryAfterMs: null
        };
      }
      let secrets = [];
      let authHeaders;
      try {
        authHeaders = await options.getAuthHeaders();
        secrets = Object.values(authHeaders).flatMap((value) => [
          value,
          ...value.split(/\s+/).filter((part) => part.length >= 8)
        ]);
      } catch (error) {
        return {
          ok: false,
          kind: "auth",
          outcome: "not_sent",
          status: null,
          message: safeMessage(`could not build auth headers: ${error instanceof Error ? error.message : String(error)}`, options.knownSecrets?.() ?? []),
          errors: null,
          retryAfterMs: null
        };
      }
      if (callerSignal?.aborted) {
        return {
          ok: false,
          kind: "aborted",
          outcome: "not_sent",
          status: null,
          message: "request aborted by caller before it was sent",
          errors: null,
          retryAfterMs: null
        };
      }
      const controller = new AbortController;
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
      const onCallerAbort = () => controller.abort();
      callerSignal?.addEventListener("abort", onCallerAbort, { once: true });
      const payload = { query: document };
      if (variables !== undefined)
        payload.variables = variables;
      if (opts?.operationName !== undefined)
        payload.operationName = opts.operationName;
      let response;
      let body;
      try {
        response = await doFetch(options.endpoint, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            ...options.headers,
            ...authHeaders
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        body = await readBoundedBody(response, opts?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES);
      } catch (error) {
        const kind = timedOut ? "timeout" : callerSignal?.aborted ? "aborted" : "network";
        const message = kind === "timeout" ? `request timed out after ${timeoutMs}ms` : kind === "aborted" ? "request aborted by caller after it was sent" : safeMessage(error instanceof Error ? error.message : String(error), secrets);
        return {
          ok: false,
          kind,
          outcome: "unknown",
          status: null,
          message,
          errors: null,
          retryAfterMs: null
        };
      } finally {
        clearTimeout(timer);
        callerSignal?.removeEventListener("abort", onCallerAbort);
      }
      const status = response.status;
      if (body.tooLarge) {
        const limit = opts?.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
        return {
          ok: false,
          kind: "too_large",
          outcome: "unknown",
          status,
          message: `response body exceeded ${limit} bytes and was discarded`,
          errors: null,
          retryAfterMs: null
        };
      }
      const text = body.text;
      let parsed;
      let isJson = true;
      try {
        parsed = JSON.parse(text);
      } catch {
        isJson = false;
      }
      const errors = isJson ? readErrors(parsed, secrets) : null;
      if (status === 401 || status === 403) {
        if (status === 401)
          options.onAuthRejected?.(authHeaders);
        return {
          ok: false,
          kind: "auth",
          outcome: "rejected",
          status,
          message: firstMessage(errors, `authentication rejected with HTTP ${status}`),
          errors,
          retryAfterMs: null
        };
      }
      if (status === 429) {
        return {
          ok: false,
          kind: "rate_limited",
          outcome: "rejected",
          status,
          message: firstMessage(errors, "rate limited"),
          errors,
          retryAfterMs: readRetryAfterMs(response.headers)
        };
      }
      if (status < 200 || status > 299) {
        const decided = status >= 400 && status < 500;
        return {
          ok: false,
          kind: "http",
          outcome: decided ? "rejected" : "unknown",
          status,
          message: firstMessage(errors, `HTTP ${status}`),
          errors,
          retryAfterMs: null
        };
      }
      if (!isJson) {
        return {
          ok: false,
          kind: "http",
          outcome: "unknown",
          status,
          message: `non-JSON response body (${text.length} bytes)`,
          errors: null,
          retryAfterMs: null
        };
      }
      const data = typeof parsed === "object" && parsed !== null && "data" in parsed ? parsed.data ?? null : null;
      if (data === null) {
        return {
          ok: false,
          kind: "graphql",
          outcome: errors && errors.length > 0 ? "rejected" : "unknown",
          status,
          message: firstMessage(errors, "GraphQL response contained neither data nor errors"),
          errors,
          retryAfterMs: null
        };
      }
      return {
        ok: true,
        outcome: "completed",
        data,
        partialErrors: errors,
        rateLimit: {
          remaining: numericHeader(response.headers, "x-ratelimit-requests-remaining"),
          resetAt: numericHeader(response.headers, "x-ratelimit-requests-reset")
        }
      };
    }
  };
}

// src/auth/oauth.ts
var OAUTH_DEFAULTS = {
  authorizeUrl: "https://linear.app/oauth/authorize",
  tokenUrl: "https://api.linear.app/oauth/token",
  revokeUrl: "https://api.linear.app/oauth/revoke",
  scopes: ["read", "write", "issues:create", "comments:create"]
};
function resolveOAuthConfig(partial) {
  if (!partial?.clientId)
    return { missing: ["clientId"] };
  return {
    clientId: partial.clientId,
    clientSecret: partial.clientSecret ?? null,
    authorizeUrl: partial.authorizeUrl ?? OAUTH_DEFAULTS.authorizeUrl,
    tokenUrl: partial.tokenUrl ?? OAUTH_DEFAULTS.tokenUrl,
    revokeUrl: partial.revokeUrl ?? OAUTH_DEFAULTS.revokeUrl,
    scopes: partial.scopes?.length ? partial.scopes : [...OAUTH_DEFAULTS.scopes]
  };
}
function createPkce() {
  const verifier = randomBytes2(64).toString("base64url");
  return {
    verifier,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
    state: randomBytes2(32).toString("base64url")
  };
}
function buildAuthorizeUrl(config, params) {
  const url = new URL(config.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", config.scopes.join(","));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("actor", params.actor);
  if (params.actor === "app")
    url.searchParams.set("prompt", "consent");
  return url.toString();
}
function redirectUriFor(redirect, port = redirect.port) {
  return `http://${redirect.host ?? "127.0.0.1"}:${port}${redirect.path ?? DEFAULT_CALLBACK_PATH}`;
}
var DEFAULT_CALLBACK_PATH = "/callback";
function callbackPage(title, detail) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:system-ui;padding:2rem"><h1>${title}</h1><p>${detail}</p></body></html>`;
}
function isErrnoCode2(error, code) {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}
function startLoopbackCallback(options) {
  const { redirect } = options;
  if (redirect.port === 0 && !redirect.allowEphemeralPort) {
    throw new Error("an OAuth redirect port of 0 would produce a redirect URI Linear cannot match; configure linear.oauth.redirectPort to the port registered in the Linear OAuth app");
  }
  const callbackPath = redirect.path ?? DEFAULT_CALLBACK_PATH;
  const pending = Promise.withResolvers();
  pending.promise.catch(() => {});
  let settled = false;
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    if (url.pathname !== callbackPath) {
      response.writeHead(404, { "content-type": "text/plain" });
      response.end("not found");
      return;
    }
    if (settled) {
      response.writeHead(410, { "content-type": "text/html" });
      response.end(callbackPage("Already handled", "This authorization callback was already used."));
      return;
    }
    const error = url.searchParams.get("error");
    const state = url.searchParams.get("state");
    const received = url.searchParams.get("code");
    settled = true;
    if (error !== null) {
      response.writeHead(400, { "content-type": "text/html" });
      response.end(callbackPage("Authorization failed", "The authorization server returned an error."));
      pending.reject(new Error(`authorization denied: ${error}`));
      return;
    }
    if (state !== options.expectedState) {
      response.writeHead(400, { "content-type": "text/html" });
      response.end(callbackPage("Authorization failed", "State parameter mismatch."));
      pending.reject(new Error("oauth state mismatch"));
      return;
    }
    if (received === null) {
      response.writeHead(400, { "content-type": "text/html" });
      response.end(callbackPage("Authorization failed", "No authorization code was provided."));
      pending.reject(new Error("missing authorization code"));
      return;
    }
    response.writeHead(200, { "content-type": "text/html" });
    response.end(callbackPage("Linear connected", "You can close this window and return to the terminal."));
    pending.resolve({ code: received });
  });
  const started = Promise.withResolvers();
  server.once("error", (error) => {
    started.reject(isErrnoCode2(error, "EADDRINUSE") ? new Error(`redirect port ${redirect.port} is already in use; configure linear.oauth.redirectPort to the port registered in the Linear OAuth app`) : error);
  });
  server.listen(redirect.port, "127.0.0.1", () => {
    const address = server.address();
    let closed = false;
    const close = () => {
      if (closed)
        return;
      closed = true;
      clearTimeout(timer);
      server.closeAllConnections();
      server.close();
    };
    const timer = setTimeout(() => {
      pending.reject(new Error(`timed out waiting for OAuth callback after ${options.timeoutMs}ms`));
      close();
    }, options.timeoutMs);
    timer.unref?.();
    started.resolve({
      redirectUri: redirectUriFor(redirect, address.port),
      waitForCode: () => pending.promise,
      close
    });
  });
  return started.promise;
}
async function postTokenRequest(url, form, fetchImpl) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: form.toString()
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`token endpoint rejected the request: HTTP ${response.status}${oauthErrorDetail(text, [...form.values()])}`);
  }
  const body = JSON.parse(text);
  if (typeof body !== "object" || body === null || !("access_token" in body)) {
    throw new Error("token endpoint response did not contain access_token");
  }
  const accessToken = body.access_token;
  if (typeof accessToken !== "string") {
    throw new Error("token endpoint returned a non-string access_token");
  }
  const refreshToken = "refresh_token" in body ? body.refresh_token : undefined;
  const expiresIn = "expires_in" in body ? body.expires_in : undefined;
  const scope = "scope" in body ? body.scope : undefined;
  return {
    accessToken,
    refreshToken: typeof refreshToken === "string" ? refreshToken : null,
    expiresIn: typeof expiresIn === "number" ? expiresIn : null,
    scope: typeof scope === "string" ? scope : null
  };
}
function oauthErrorDetail(body, sent) {
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return "";
  }
  if (typeof parsed !== "object" || parsed === null)
    return "";
  const record = new Map(Object.entries(parsed));
  const fields = [record.get("error"), record.get("error_description")].filter((value) => typeof value === "string" && value.length > 0);
  return fields.length > 0 ? ` ${safeMessage(fields.join(": "), sent)}` : "";
}
function exchangeCode(config, params, fetchImpl = fetch) {
  const form = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: config.clientId,
    code_verifier: params.verifier
  });
  if (config.clientSecret)
    form.set("client_secret", config.clientSecret);
  return postTokenRequest(config.tokenUrl, form, fetchImpl);
}
function refreshAccessToken(config, refreshToken, fetchImpl = fetch) {
  const form = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: config.clientId
  });
  if (config.clientSecret)
    form.set("client_secret", config.clientSecret);
  return postTokenRequest(config.tokenUrl, form, fetchImpl);
}
function requestClientCredentialsToken(config, scopes, fetchImpl = fetch) {
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    scope: scopes.join(","),
    client_id: config.clientId,
    client_secret: config.clientSecret
  });
  return postTokenRequest(config.tokenUrl, form, fetchImpl);
}
async function revokeToken(config, accessToken, fetchImpl = fetch) {
  const form = new URLSearchParams({ token: accessToken, client_id: config.clientId });
  if (config.clientSecret)
    form.set("client_secret", config.clientSecret);
  const response = await fetchImpl(config.revokeUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
    body: form.toString()
  });
  if (!response.ok) {
    throw new Error(`token revocation failed: HTTP ${response.status}`);
  }
}
async function loginOAuth(options) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const pkce = createPkce();
  const callback = await startLoopbackCallback({
    expectedState: pkce.state,
    timeoutMs: options.timeoutMs ?? 300000,
    redirect: options.redirect
  });
  try {
    await options.openUrl(buildAuthorizeUrl(options.cfg, {
      challenge: pkce.challenge,
      state: pkce.state,
      redirectUri: callback.redirectUri,
      actor: options.actor
    }));
    const { code } = await callback.waitForCode();
    const tokens = await exchangeCode(options.cfg, { code, verifier: pkce.verifier, redirectUri: callback.redirectUri }, fetchImpl);
    const connection = {
      id: `linear-oauth-${randomUUID().slice(0, 8)}`,
      kind: "oauth",
      label: options.label,
      actor: options.actor,
      workspace: null,
      createdAt: new Date().toISOString(),
      secret: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresIn === null ? null : Date.now() + tokens.expiresIn * 1000,
        scope: tokens.scope
      }
    };
    await options.store.upsert(connection);
    return summarize(connection);
  } finally {
    callback.close();
  }
}
var REFRESH_MARGIN_MS = 60000;
async function ensureFreshAccessToken(config, store, id, fetchImpl = fetch, now = Date.now) {
  const before = store.get(id);
  if (!before)
    throw new Error(`unknown Linear connection: ${id}`);
  if (before.kind !== "oauth")
    return before;
  if (before.secret.expiresAt === null || before.secret.expiresAt - REFRESH_MARGIN_MS > now()) {
    return before;
  }
  return store.transaction(async (tx) => {
    const connection = tx.get(id);
    if (!connection)
      throw new Error(`unknown Linear connection: ${id}`);
    if (connection.kind !== "oauth")
      return connection;
    const { expiresAt, refreshToken } = connection.secret;
    if (expiresAt === null || expiresAt - REFRESH_MARGIN_MS > now())
      return connection;
    if (refreshToken === null) {
      throw new Error(`connection ${id} has an expired access token and no refresh token; re-login required`);
    }
    const tokens = await refreshAccessToken(config, refreshToken, fetchImpl);
    const refreshed = {
      ...connection,
      secret: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken ?? refreshToken,
        expiresAt: tokens.expiresIn === null ? null : now() + tokens.expiresIn * 1000,
        scope: tokens.scope ?? connection.secret.scope
      }
    };
    tx.upsert(refreshed);
    return refreshed;
  });
}

// src/auth/app-credentials.ts
var APP_CREDENTIALS_SCOPES = ["read", "write"];
var RENEW_BEFORE_MS = 24 * 60 * 60 * 1000;
function readAppCredentialsFile(file) {
  const values = readEnvKeys(file, ["LINEAR_CLIENT_ID", "LINEAR_CLIENT_SECRET"], "Linear app credentials file");
  return { clientId: values.LINEAR_CLIENT_ID, clientSecret: values.LINEAR_CLIENT_SECRET };
}
var cache = new Map;
function cacheKey(tokenUrl, credentials) {
  return `${tokenUrl}
${credentials.clientId}
${credentials.clientSecret}`;
}
function appAccessToken(credentials, tokenUrl, fetchImpl, now = Date.now) {
  const key = cacheKey(tokenUrl, credentials);
  const cached = cache.get(key);
  if (cached && (cached.expiresAt === undefined || cached.expiresAt - now() > RENEW_BEFORE_MS))
    return cached.token;
  const entry = {
    token: requestClientCredentialsToken({ tokenUrl, ...credentials }, APP_CREDENTIALS_SCOPES, fetchImpl).then((tokens) => {
      entry.accessToken = tokens.accessToken;
      entry.expiresAt = tokens.expiresIn === null ? Number.POSITIVE_INFINITY : now() + tokens.expiresIn * 1000;
      return tokens.accessToken;
    }, (error) => {
      if (cache.get(key) === entry)
        cache.delete(key);
      throw error;
    })
  };
  cache.set(key, entry);
  return entry.token;
}
function forgetAppAccessToken(credentials, tokenUrl, rejected) {
  const key = cacheKey(tokenUrl, credentials);
  if (cache.get(key)?.accessToken === rejected)
    cache.delete(key);
}
function cachedAppAccessToken(credentials, tokenUrl) {
  return cache.get(cacheKey(tokenUrl, credentials))?.accessToken ?? null;
}

// src/catalog/search.ts
var K1 = 1.2;
var B = 0.75;
var SYNONYM_GROUPS = {
  create: ["create", "creates", "created", "add", "new"],
  update: ["update", "updates", "edit", "modify", "rename"],
  delete: ["delete", "remove", "archive"],
  comment: ["comment", "comments", "reply"],
  transition: ["transition", "status", "state", "workflow", "done"],
  issue: ["issue", "issues", "ticket", "task"],
  project: ["project", "projects"],
  milestone: ["milestone", "milestones"],
  team: ["team", "teams"],
  raw: ["raw", "graphql", "custom", "gql"],
  help: ["help", "schema", "docs", "reference"],
  search: ["search", "find", "query", "lookup"],
  assign: ["assign", "assignee", "owner"],
  label: ["label", "labels", "tag"],
  relation: ["relation", "relations", "link", "blocks"],
  user: ["user", "users", "member"],
  cycle: ["cycle", "cycles", "sprint"],
  list: ["list", "get", "fetch", "read", "show"]
};
var CANONICAL = {};
for (const [canonical, aliases] of Object.entries(SYNONYM_GROUPS)) {
  for (const alias of aliases)
    CANONICAL[alias] = canonical;
}
function tokenize(text) {
  const out = [];
  for (const chunk of text.split(/[^\p{L}\p{N}]+/u)) {
    if (!chunk)
      continue;
    for (const part of chunk.replace(/([\p{Ll}\p{N}])([\p{Lu}])/gu, "$1 $2").split(" ")) {
      const token = part.toLowerCase();
      if (!token)
        continue;
      out.push(CANONICAL[token] ?? token);
    }
  }
  return out;
}
function createSearchIndex(docs) {
  const documentFrequency = new Map;
  const indexed = docs.map((doc) => {
    const tokens = tokenize(`${doc.tool} ${doc.kind} ${doc.root} ${doc.text}`);
    const frequencies = new Map;
    for (const token of tokens)
      frequencies.set(token, (frequencies.get(token) ?? 0) + 1);
    for (const token of frequencies.keys())
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    return { doc, length: tokens.length, frequencies };
  });
  const totalLength = indexed.reduce((sum, entry) => sum + entry.length, 0);
  return { docs: indexed, documentFrequency, averageLength: indexed.length ? totalLength / indexed.length : 0 };
}
function search(index, query, limit = 5) {
  const terms = [...new Set(tokenize(query))];
  if (!terms.length || !index.docs.length)
    return [];
  const total = index.docs.length;
  const hits = [];
  for (const entry of index.docs) {
    let score = 0;
    const matched = [];
    for (const term of terms) {
      const frequency = entry.frequencies.get(term);
      if (!frequency)
        continue;
      const df = index.documentFrequency.get(term) ?? 0;
      const idf = Math.log(1 + (total - df + 0.5) / (df + 0.5));
      const norm = frequency * (K1 + 1);
      const denominator = frequency + K1 * (1 - B + B * entry.length / (index.averageLength || 1));
      score += idf * (norm / denominator);
      matched.push(term);
    }
    if (score <= 0)
      continue;
    hits.push({
      tool: entry.doc.tool,
      kind: entry.doc.kind,
      root: entry.doc.root,
      score,
      summary: `${entry.doc.kind}.${entry.doc.root} \u2014 matched: ${matched.sort().join(", ")}`
    });
  }
  hits.sort((a, b) => b.score !== a.score ? b.score - a.score : a.tool < b.tool ? -1 : a.tool > b.tool ? 1 : 0);
  return hits.slice(0, Math.max(0, limit));
}

// src/identity/names.ts
var AGENT_DISPLAY_NAMES = {
  task: "Task Agent",
  build: "Builder",
  integrator: "Integrator",
  slow: "Senior Engineer",
  sonic: "Quick Helper",
  "python-engineer": "Python Engineer",
  "rust-engineer": "Rust Engineer",
  "typescript-engineer": "TypeScript Engineer",
  "ui-engineer": "UI Engineer",
  "tui-engineer": "TUI Engineer",
  "docs-engineer": "Docs Engineer",
  "data-engineer": "Data Engineer",
  "go-engineer": "Go Engineer",
  reviewer: "Code Reviewer",
  "code-reviewer": "Code Reviewer",
  "architecture-reviewer": "Architecture Reviewer",
  "contract-reviewer": "Contract Reviewer",
  "security-reviewer": "Security Reviewer",
  "performance-reviewer": "Performance Reviewer",
  "tui-reviewer": "TUI Reviewer",
  "ux-ui-reviewer": "UX/UI Reviewer",
  "completion-reviewer": "Completion Reviewer",
  evaluator: "Evaluator",
  scout: "Scout",
  investigate: "Investigator",
  "root-cause-investigator": "Root Cause Investigator",
  researcher: "Researcher",
  seance: "Session Historian",
  brainstorm: "Brainstormer",
  "complex-change-engineer": "Senior Engineer",
  "cross-stack-engineer": "Cross-Stack Engineer"
};
var KNOWN_WORDS = {
  ui: "UI",
  tui: "TUI",
  ux: "UX",
  api: "API",
  cli: "CLI",
  sql: "SQL",
  db: "DB",
  qa: "QA",
  mcp: "MCP",
  ai: "AI",
  typescript: "TypeScript",
  javascript: "JavaScript",
  go: "Go"
};
function agentDisplayName(name) {
  const known = Object.hasOwn(AGENT_DISPLAY_NAMES, name) ? AGENT_DISPLAY_NAMES[name] : undefined;
  if (known !== undefined)
    return known;
  return name.split(/[-_]+/).filter(Boolean).map((word) => {
    const lower = word.toLowerCase();
    return (Object.hasOwn(KNOWN_WORDS, lower) ? KNOWN_WORDS[lower] : undefined) ?? lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join(" ");
}

// src/identity/actor.ts
function resolveAuthor(agent) {
  if (!agent)
    throw new Error("linear: host does not expose ctx.agent; OMP >= 18.20.0 is required");
  const displayName = agent.kind === "main" ? "Main" : agent.name;
  return { id: agent.id, displayName, label: authorLabel(agent) };
}
function authorLabel(agent) {
  return agent.kind === "main" ? null : agentDisplayName(agent.name);
}

// src/ops/resolve.ts
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var ISSUE_IDENTIFIER_PATTERN = /^([A-Za-z][A-Za-z0-9_]*)-([0-9]+)$/;
var TEAM_LOOKUP = `query LinearTeamLookup($ref: String!) {
  teams(filter: { or: [{ key: { eq: $ref } }, { name: { eq: $ref } }] }, first: 10) {
    nodes { id key name }
  }
}`;
var ISSUE_LOOKUP = `query LinearIssueLookup($teamKey: String!, $number: Float!) {
  issues(filter: { team: { key: { eq: $teamKey } }, number: { eq: $number } }, first: 10) {
    nodes { id identifier title }
  }
}`;
var STATE_LOOKUP = `query LinearStateLookup($teamId: ID!, $name: String!) {
  workflowStates(filter: { team: { id: { eq: $teamId } }, name: { eq: $name } }, first: 10) {
    nodes { id name type team { id key } }
  }
}`;
var LABEL_LOOKUP = `query LinearLabelLookup($name: String!) {
  issueLabels(filter: { name: { eq: $name } }, first: 10) {
    nodes { id name team { id key } }
  }
}`;
var PROJECT_LOOKUP = `query LinearProjectLookup($name: String!) {
  projects(filter: { name: { eq: $name } }, first: 10) {
    nodes { id name }
  }
}`;
var MILESTONE_LOOKUP = `query LinearMilestoneLookup($projectId: ID!, $name: String!) {
  projectMilestones(filter: { project: { id: { eq: $projectId } }, name: { eq: $name } }, first: 10) {
    nodes { id name }
  }
}`;
var VIEWER_LOOKUP = `query LinearViewerLookup {
  viewer { id }
}`;
var USER_LOOKUP = `query LinearUserLookup($ref: String!) {
  users(filter: { or: [{ displayName: { eqIgnoreCase: $ref } }, { name: { eqIgnoreCase: $ref } }, { email: { eqIgnoreCase: $ref } }] }, first: 10) {
    nodes { id name displayName email active }
  }
}`;
var DOCUMENT_LOOKUP = `query LinearDocumentLookup($ref: String!) {
  documents(filter: { or: [{ slugId: { eq: $ref } }, { title: { eq: $ref } }] }, first: 10) {
    nodes { id title slugId }
  }
}`;
async function request(client, document, variables) {
  const result = await client.execute(document, variables);
  if (!result.ok) {
    throw new Error(`linear request failed (${result.kind}): ${result.message}`);
  }
  const { data } = result;
  if (typeof data !== "object" || data === null) {
    throw new Error("linear request returned a non-object data payload");
  }
  return data;
}
function readRecord(value, field) {
  if (typeof value !== "object" || value === null || !(field in value)) {
    throw new Error(`linear response is missing "${field}"`);
  }
  const nested = value[field];
  if (typeof nested !== "object" || nested === null) {
    throw new Error(`linear response field "${field}" is not an object`);
  }
  return nested;
}
function connectionNodes(data, root) {
  const nodes = readRecord(data, root).nodes;
  if (!Array.isArray(nodes)) {
    throw new Error(`linear response field "${root}.nodes" is not a list`);
  }
  return nodes;
}
function exactlyOne(nodes, what, ref, describe) {
  if (nodes.length === 0)
    throw new Error(`${what} not found: ${JSON.stringify(ref)}`);
  if (nodes.length > 1) {
    const candidates = nodes.map((node) => `${node.id} (${describe(node)})`).join(", ");
    throw new Error(`ambiguous ${what} ${JSON.stringify(ref)}: ${nodes.length} candidates: ${candidates}`);
  }
  return nodes[0];
}
async function resolveTeamId(client, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  const data = await request(client, TEAM_LOOKUP, { ref });
  return exactlyOne(connectionNodes(data, "teams"), "team", ref, (node) => `${node.key} ${node.name}`).id;
}
async function resolveIssueId(client, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  const match = ISSUE_IDENTIFIER_PATTERN.exec(ref);
  if (!match) {
    throw new Error(`issue reference must be a UUID or an identifier like ABC-12, got ${JSON.stringify(ref)}`);
  }
  const data = await request(client, ISSUE_LOOKUP, {
    teamKey: match[1].toUpperCase(),
    number: Number(match[2])
  });
  return exactlyOne(connectionNodes(data, "issues"), "issue", ref, (node) => String(node.identifier)).id;
}
async function resolveStateId(client, teamId, name) {
  if (UUID_PATTERN.test(name))
    return name;
  const data = await request(client, STATE_LOOKUP, { teamId, name });
  return exactlyOne(connectionNodes(data, "workflowStates"), "workflow state", name, (node) => `${node.name}/${node.type}`).id;
}
async function resolveLabelIds(client, names) {
  const ids = [];
  for (const name of names) {
    if (UUID_PATTERN.test(name)) {
      ids.push(name);
      continue;
    }
    const data = await request(client, LABEL_LOOKUP, { name });
    ids.push(exactlyOne(connectionNodes(data, "issueLabels"), "label", name, (node) => {
      const team = node.team;
      const scope = typeof team === "object" && team !== null && "key" in team ? String(team.key) : "workspace";
      return `${node.name} in ${scope}`;
    }).id);
  }
  return ids;
}
async function resolveProjectId(client, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  const data = await request(client, PROJECT_LOOKUP, { name: ref });
  return exactlyOne(connectionNodes(data, "projects"), "project", ref, (node) => String(node.name)).id;
}
async function resolveMilestoneId(client, projectId, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  const data = await request(client, MILESTONE_LOOKUP, { projectId, name: ref });
  return exactlyOne(connectionNodes(data, "projectMilestones"), "project milestone", ref, (node) => String(node.name)).id;
}
async function resolveUserId(client, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  if (ref.toLowerCase() === "me") {
    const id = readRecord(await request(client, VIEWER_LOOKUP), "viewer").id;
    if (typeof id !== "string")
      throw new Error('linear response field "viewer.id" is not a string');
    return id;
  }
  const data = await request(client, USER_LOOKUP, { ref });
  return exactlyOne(connectionNodes(data, "users"), "user", ref, (node) => `${node.displayName} <${node.email}>`).id;
}
async function resolveDocumentId(client, ref) {
  if (UUID_PATTERN.test(ref))
    return ref;
  const data = await request(client, DOCUMENT_LOOKUP, { ref });
  return exactlyOne(connectionNodes(data, "documents"), "document", ref, (node) => `${node.title} ${node.slugId}`).id;
}

// src/ops/index.ts
function applyActorAttribution(input, actorCtx) {
  if (actorCtx.actor === "app" && actorCtx.authorLabel !== null)
    input.createAsUser = actorCtx.authorLabel;
}
var ISSUE_FIELDS = `id identifier title description url priority createdAt updatedAt
    state { id name type }
    team { id key name }
    assignee { id displayName }
    project { id name }
    projectMilestone { id name }
    labels(first: 50) { nodes { id name } }`;
var ISSUE_GET = `query LinearIssueGet($id: String!) {
  issue(id: $id) { ${ISSUE_FIELDS} }
}`;
var ISSUE_WITH_RELATIONS_GET = `query LinearIssueRelationsGet($id: String!) {
  issue(id: $id) {
    id identifier updatedAt
    relations(first: 50) { nodes { id type relatedIssue { id identifier title } } }
  }
}`;
var ISSUE_CREATED_GET = `query LinearIssueCreatedGet($id: String!) {
  issue(id: $id) {
    ${ISSUE_FIELDS}
    relations(first: 50) { nodes { id type relatedIssue { id identifier title } } }
    inverseRelations(first: 50) { nodes { id type issue { id identifier title } } }
  }
}`;
var COMMENT_GET = `query LinearCommentGet($id: String!) {
  comment(id: $id) {
    id body url createdAt
    user { id displayName }
    issue { id identifier }
  }
}`;
var PROJECT_GET = `query LinearProjectGet($id: String!) {
  project(id: $id) {
    id name description url startDate targetDate createdAt updatedAt
    status { id name type }
    lead { id name displayName }
    teams { nodes { id key name } }
    projectMilestones { nodes { id name targetDate } }
  }
}`;
var MILESTONE_GET = `query LinearMilestoneGet($id: String!) {
  projectMilestone(id: $id) {
    id name description targetDate createdAt updatedAt
    project { id name }
  }
}`;
var ISSUE_CREATE = `mutation LinearIssueCreate($input: IssueCreateInput!) {
  issueCreate(input: $input) { success issue { id } }
}`;
var ISSUE_UPDATE = `mutation LinearIssueUpdate($id: String!, $input: IssueUpdateInput!) {
  issueUpdate(id: $id, input: $input) { success issue { id } }
}`;
var COMMENT_CREATE = `mutation LinearCommentCreate($input: CommentCreateInput!) {
  commentCreate(input: $input) { success comment { id } }
}`;
var RELATION_CREATE = `mutation LinearIssueRelationCreate($input: IssueRelationCreateInput!) {
  issueRelationCreate(input: $input) { success issueRelation { id issue { id } } }
}`;
var PROJECT_CREATE = `mutation LinearProjectCreate($input: ProjectCreateInput!) {
  projectCreate(input: $input) { success project { id } }
}`;
var PROJECT_UPDATE = `mutation LinearProjectUpdate($id: String!, $input: ProjectUpdateInput!) {
  projectUpdate(id: $id, input: $input) { success project { id } }
}`;
var MILESTONE_CREATE = `mutation LinearMilestoneCreate($input: ProjectMilestoneCreateInput!) {
  projectMilestoneCreate(input: $input) { success projectMilestone { id } }
}`;
var MILESTONE_UPDATE = `mutation LinearMilestoneUpdate($id: String!, $input: ProjectMilestoneUpdateInput!) {
  projectMilestoneUpdate(id: $id, input: $input) { success projectMilestone { id } }
}`;
var ISSUE_PAGE = `nodes {
      id identifier title url priority updatedAt
      state { name type }
      team { key }
      assignee { displayName }
      project { id name }
    }
    pageInfo { hasNextPage endCursor }`;
var ISSUE_SEARCH = `query LinearIssueSearch($term: String!, $filter: IssueFilter, $first: Int, $after: String, $includeArchived: Boolean) {
  searchIssues(term: $term, filter: $filter, first: $first, after: $after, includeArchived: $includeArchived) {
    ${ISSUE_PAGE}
  }
}`;
var ISSUE_LIST = `query LinearIssueList($filter: IssueFilter, $first: Int, $after: String, $includeArchived: Boolean) {
  issues(filter: $filter, first: $first, after: $after, includeArchived: $includeArchived) {
    ${ISSUE_PAGE}
  }
}`;
var PROJECT_STATUS_POST = `mutation LinearProjectStatusPost($input: ProjectUpdateCreateInput!) {
  projectUpdateCreate(input: $input) { success projectUpdate { id } }
}`;
var PROJECT_STATUS_GET = `query LinearProjectStatusGet($id: String!) {
  projectUpdate(id: $id) {
    id body health url createdAt
    project { id name }
    user { displayName }
  }
}`;
var ISSUE_LINK_ADD = `mutation LinearIssueLinkAdd($issueId: String!, $url: String!, $title: String, $createAsUser: String) {
  attachmentLinkURL(issueId: $issueId, url: $url, title: $title, createAsUser: $createAsUser) {
    success attachment { id }
  }
}`;
var ATTACHMENT_GET = `query LinearAttachmentGet($id: String!) {
  attachment(id: $id) { id title url issue { identifier } }
}`;
var DOCUMENT_CREATE = `mutation LinearDocumentCreate($input: DocumentCreateInput!) {
  documentCreate(input: $input) { success document { id } }
}`;
var DOCUMENT_UPDATE = `mutation LinearDocumentUpdate($id: String!, $input: DocumentUpdateInput!) {
  documentUpdate(id: $id, input: $input) { success document { id } }
}`;
var DOCUMENT_GET = `query LinearDocumentGet($id: String!) {
  document(id: $id) {
    id title slugId url content updatedAt
    project { id name }
    issue { identifier }
  }
}`;
function record(value, field, context) {
  if (typeof value !== "object" || value === null || !(field in value)) {
    throw new Error(`${context}: linear response is missing "${field}"`);
  }
  const nested = value[field];
  if (typeof nested !== "object" || nested === null) {
    throw new Error(`${context}: linear response field "${field}" is not an object`);
  }
  return nested;
}
function text(value, field, context) {
  const nested = typeof value === "object" && value !== null && field in value ? value[field] : undefined;
  if (typeof nested !== "string")
    throw new Error(`${context}: expected string "${field}"`);
  return nested;
}
async function mutateForId(client, document, variables, payloadField, entityField) {
  const result = await client.execute(document, variables);
  if (!result.ok) {
    if (result.outcome === "unknown") {
      throw new Error(`${payloadField}: outcome unknown \u2014 the mutation was sent and no trustworthy response arrived (${result.kind}: ${result.message}); it may or may not have been applied, so it was neither retried nor refetched \u2014 check Linear`);
    }
    throw new Error(`${payloadField} failed (${result.kind}): ${result.message}`);
  }
  const data = result.data;
  if (typeof data !== "object" || data === null) {
    throw new Error(`${payloadField}: mutation returned a non-object data payload`);
  }
  for (const [root, value] of Object.entries(data)) {
    if (typeof value === "object" && value !== null && "success" in value && value.success === false) {
      throw new Error(`${root} reported success: false`);
    }
  }
  const payload = record(data, payloadField, payloadField);
  return text(record(payload, entityField, payloadField), "id", payloadField);
}
function optionalString(args, key) {
  const value = args[key];
  if (value === undefined || value === null)
    return;
  if (typeof value !== "string")
    throw new Error(`argument "${key}" must be a string`);
  return value;
}
function requiredString(args, key) {
  const value = optionalString(args, key);
  if (value === undefined)
    throw new Error(`argument "${key}" is required`);
  return value;
}
function stringList(args, key) {
  const value = args[key];
  if (value === undefined || value === null)
    return;
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`argument "${key}" must be a list of strings`);
  }
  return value;
}
function optionalNumber(args, key) {
  const value = args[key];
  if (value === undefined || value === null)
    return;
  if (typeof value !== "number")
    throw new Error(`argument "${key}" must be a number`);
  return value;
}
function assertExpected(issue, args, reference) {
  const expectedState = optionalString(args, "expectedStateName");
  if (expectedState !== undefined) {
    const observed = text(record(issue, "state", "issue"), "name", "issue.state");
    if (observed !== expectedState) {
      throw new Error(`expected ${reference} to be in state ${JSON.stringify(expectedState)}, observed ${JSON.stringify(observed)}`);
    }
  }
  const expectedUpdatedAt = optionalString(args, "expectedUpdatedAt");
  if (expectedUpdatedAt !== undefined) {
    const observed = text(issue, "updatedAt", "issue");
    if (observed !== expectedUpdatedAt) {
      throw new Error(`expected ${reference} updatedAt ${JSON.stringify(expectedUpdatedAt)}, observed ${JSON.stringify(observed)}`);
    }
  }
}
var ISSUE_REF = {
  type: "string",
  description: "Issue UUID or identifier such as ABC-12"
};
var EXPECTED_ARGS = {
  expectedStateName: {
    type: "string",
    description: "Fail before mutating unless the issue is currently in this workflow state"
  },
  expectedUpdatedAt: {
    type: "string",
    description: "Fail before mutating unless the issue updatedAt matches this ISO timestamp exactly"
  }
};
var USER_REF = {
  type: "string",
  minLength: 1,
  description: 'User: "me", display name, name, email or UUID'
};
var RELATION_TYPES = ["blocks", "blockedBy", "related", "duplicate"];
function relationList(args) {
  const value = args.relations;
  if (value === undefined || value === null)
    return [];
  if (!Array.isArray(value))
    throw new Error('argument "relations" must be a list');
  return value.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error('each relation must be an object with "type" and "issue"');
    }
    const relation = entry;
    const type = requiredString(relation, "type");
    if (!RELATION_TYPES.includes(type)) {
      throw new Error(`relation type must be one of ${RELATION_TYPES.join(", ")}, got ${JSON.stringify(type)}`);
    }
    return { type, issue: requiredString(relation, "issue") };
  });
}
async function createRelations(client, issueId, relations) {
  const label = (relation) => `${relation.type} ${relation.issue}`;
  for (const [index, relation] of relations.entries()) {
    const input = relation.type === "blockedBy" ? { issueId: relation.otherId, relatedIssueId: issueId, type: "blocks" } : { issueId, relatedIssueId: relation.otherId, type: relation.type };
    try {
      await mutateForId(client, RELATION_CREATE, { input }, "issueRelationCreate", "issueRelation");
    } catch (error) {
      const created = relations.slice(0, index).map(label);
      const notCreated = relations.slice(index).map(label);
      throw new Error(`issue ${issueId} was created, but relation "${label(relation)}" failed: ${error.message}; relations created: [${created.join(", ")}]; not created: [${notCreated.join(", ")}]`);
    }
  }
}
var issueCreate = {
  name: "linear_issue_create",
  description: "Create an issue in a team, resolving team, state, labels, project, milestone, assignee and related issues by key, name or identifier.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      team: { type: "string", description: "Team key, name or UUID" },
      title: { type: "string", minLength: 1 },
      description: { type: "string" },
      state: { type: "string", description: "Workflow state name or UUID" },
      labels: { type: "array", items: { type: "string" } },
      project: { type: "string", description: "Project name or UUID" },
      milestone: { type: "string", description: "Project milestone name or UUID; requires project" },
      assignee: USER_REF,
      parentIssue: ISSUE_REF,
      priority: { type: "integer", minimum: 0, maximum: 4 },
      dueDate: { type: "string", description: "ISO date (YYYY-MM-DD)" },
      relations: {
        type: "array",
        description: "Relations created after the issue; blockedBy means the other issue blocks the new one",
        items: {
          type: "object",
          properties: { type: { type: "string", enum: RELATION_TYPES }, issue: ISSUE_REF },
          required: ["type", "issue"],
          additionalProperties: false
        }
      }
    },
    required: ["team", "title"],
    additionalProperties: false
  },
  async run(client, args, actorCtx) {
    const teamId = await resolveTeamId(client, requiredString(args, "team"));
    const input = { teamId, title: requiredString(args, "title") };
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    const state = optionalString(args, "state");
    if (state !== undefined)
      input.stateId = await resolveStateId(client, teamId, state);
    const labels = stringList(args, "labels");
    if (labels !== undefined)
      input.labelIds = await resolveLabelIds(client, labels);
    const project = optionalString(args, "project");
    let projectId;
    if (project !== undefined) {
      projectId = await resolveProjectId(client, project);
      input.projectId = projectId;
    }
    const milestone = optionalString(args, "milestone");
    if (milestone !== undefined) {
      if (projectId === undefined)
        throw new Error('argument "milestone" requires "project"');
      input.projectMilestoneId = await resolveMilestoneId(client, projectId, milestone);
    }
    const assignee = optionalString(args, "assignee");
    if (assignee !== undefined)
      input.assigneeId = await resolveUserId(client, assignee);
    const parentIssue = optionalString(args, "parentIssue");
    if (parentIssue !== undefined)
      input.parentId = await resolveIssueId(client, parentIssue);
    const priority = optionalNumber(args, "priority");
    if (priority !== undefined)
      input.priority = priority;
    const dueDate = optionalString(args, "dueDate");
    if (dueDate !== undefined)
      input.dueDate = dueDate;
    const relations = [];
    for (const relation of relationList(args)) {
      relations.push({ ...relation, otherId: await resolveIssueId(client, relation.issue) });
    }
    applyActorAttribution(input, actorCtx);
    const id = await mutateForId(client, ISSUE_CREATE, { input }, "issueCreate", "issue");
    await createRelations(client, id, relations);
    const refetch = relations.length > 0 ? ISSUE_CREATED_GET : ISSUE_GET;
    return { issue: record(await request(client, refetch, { id }), "issue", "issueGet") };
  }
};
var issueUpdate = {
  name: "linear_issue_update",
  description: "Update issue fields, optionally guarded by the expected current state or updatedAt.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      issue: ISSUE_REF,
      title: { type: "string" },
      description: { type: "string" },
      state: { type: "string" },
      labels: { type: "array", items: { type: "string" } },
      project: { type: "string" },
      milestone: { type: "string" },
      assignee: USER_REF,
      priority: { type: "integer", minimum: 0, maximum: 4 },
      dueDate: { type: "string" },
      ...EXPECTED_ARGS
    },
    required: ["issue"],
    additionalProperties: false
  },
  async run(client, args) {
    const reference = requiredString(args, "issue");
    const id = await resolveIssueId(client, reference);
    const state = optionalString(args, "state");
    const needsCurrent = state !== undefined || args.expectedStateName !== undefined || args.expectedUpdatedAt !== undefined;
    let stateId;
    if (needsCurrent) {
      const current = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
      assertExpected(current, args, reference);
      if (state !== undefined) {
        const teamId = text(record(current, "team", "issue"), "id", "issue.team");
        stateId = await resolveStateId(client, teamId, state);
      }
    }
    const input = {};
    const title = optionalString(args, "title");
    if (title !== undefined)
      input.title = title;
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    if (stateId !== undefined)
      input.stateId = stateId;
    const labels = stringList(args, "labels");
    if (labels !== undefined)
      input.labelIds = await resolveLabelIds(client, labels);
    const project = optionalString(args, "project");
    let projectId;
    if (project !== undefined) {
      projectId = await resolveProjectId(client, project);
      input.projectId = projectId;
    }
    const milestone = optionalString(args, "milestone");
    if (milestone !== undefined) {
      if (projectId === undefined)
        throw new Error('argument "milestone" requires "project"');
      input.projectMilestoneId = await resolveMilestoneId(client, projectId, milestone);
    }
    const assignee = optionalString(args, "assignee");
    if (assignee !== undefined)
      input.assigneeId = await resolveUserId(client, assignee);
    const priority = optionalNumber(args, "priority");
    if (priority !== undefined)
      input.priority = priority;
    const dueDate = optionalString(args, "dueDate");
    if (dueDate !== undefined)
      input.dueDate = dueDate;
    if (Object.keys(input).length === 0)
      throw new Error("no issue fields to update");
    await mutateForId(client, ISSUE_UPDATE, { id, input }, "issueUpdate", "issue");
    return { issue: record(await request(client, ISSUE_GET, { id }), "issue", "issueGet") };
  }
};
var issueTransition = {
  name: "linear_issue_transition",
  description: "Move an issue to another workflow state, guarded by the expected current state.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      issue: ISSUE_REF,
      targetState: { type: "string", description: "Workflow state name or UUID" },
      expectedStateName: EXPECTED_ARGS.expectedStateName,
      expectedUpdatedAt: EXPECTED_ARGS.expectedUpdatedAt
    },
    required: ["issue", "targetState"],
    additionalProperties: false
  },
  async run(client, args) {
    const reference = requiredString(args, "issue");
    const id = await resolveIssueId(client, reference);
    const current = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
    assertExpected(current, args, reference);
    const teamId = text(record(current, "team", "issue"), "id", "issue.team");
    const stateId = await resolveStateId(client, teamId, requiredString(args, "targetState"));
    await mutateForId(client, ISSUE_UPDATE, { id, input: { stateId } }, "issueUpdate", "issue");
    const refetched = record(await request(client, ISSUE_GET, { id }), "issue", "issueGet");
    return {
      issue: refetched,
      requestedState: args.targetState,
      observedState: record(refetched, "state", "issue").name
    };
  }
};
var issueGet = {
  name: "linear_issue_get",
  description: "Fetch one issue with its state, team, assignee, project, milestone and labels.",
  tier: "read",
  parameters: {
    type: "object",
    properties: { issue: ISSUE_REF },
    required: ["issue"],
    additionalProperties: false
  },
  async run(client, args) {
    const id = await resolveIssueId(client, requiredString(args, "issue"));
    return { issue: record(await request(client, ISSUE_GET, { id }), "issue", "issueGet") };
  }
};
var issueCommentAdd = {
  name: "linear_issue_comment_add",
  description: "Add a comment to an issue and return the stored comment.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      issue: ISSUE_REF,
      body: { type: "string", minLength: 1 }
    },
    required: ["issue", "body"],
    additionalProperties: false
  },
  async run(client, args, actorCtx) {
    const issueId = await resolveIssueId(client, requiredString(args, "issue"));
    const input = { issueId, body: requiredString(args, "body") };
    applyActorAttribution(input, actorCtx);
    const id = await mutateForId(client, COMMENT_CREATE, { input }, "commentCreate", "comment");
    return { comment: record(await request(client, COMMENT_GET, { id }), "comment", "commentGet") };
  }
};
var issueRelationAdd = {
  name: "linear_issue_relation_add",
  description: "Relate two issues (blocks, duplicate, related, similar) and return the updated issue.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      issue: ISSUE_REF,
      relatedIssue: ISSUE_REF,
      type: { type: "string", enum: ["blocks", "duplicate", "related", "similar"] }
    },
    required: ["issue", "relatedIssue", "type"],
    additionalProperties: false
  },
  async run(client, args) {
    const issueId = await resolveIssueId(client, requiredString(args, "issue"));
    const relatedIssueId = await resolveIssueId(client, requiredString(args, "relatedIssue"));
    const type = requiredString(args, "type");
    await mutateForId(client, RELATION_CREATE, { input: { issueId, relatedIssueId, type } }, "issueRelationCreate", "issueRelation");
    return {
      issue: record(await request(client, ISSUE_WITH_RELATIONS_GET, { id: issueId }), "issue", "issueGet")
    };
  }
};
var projectCreate = {
  name: "linear_project_create",
  description: "Create a project for one or more teams, resolving team keys or names.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      teams: { type: "array", items: { type: "string" }, minItems: 1 },
      description: { type: "string" },
      lead: USER_REF,
      startDate: { type: "string" },
      targetDate: { type: "string" }
    },
    required: ["name", "teams"],
    additionalProperties: false
  },
  async run(client, args) {
    const teams = stringList(args, "teams");
    if (teams === undefined || teams.length === 0)
      throw new Error('argument "teams" is required');
    const teamIds = [];
    for (const team of teams)
      teamIds.push(await resolveTeamId(client, team));
    const input = { name: requiredString(args, "name"), teamIds };
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    const lead = optionalString(args, "lead");
    if (lead !== undefined)
      input.leadId = await resolveUserId(client, lead);
    const startDate = optionalString(args, "startDate");
    if (startDate !== undefined)
      input.startDate = startDate;
    const targetDate = optionalString(args, "targetDate");
    if (targetDate !== undefined)
      input.targetDate = targetDate;
    const id = await mutateForId(client, PROJECT_CREATE, { input }, "projectCreate", "project");
    return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
  }
};
var projectUpdate = {
  name: "linear_project_update",
  description: "Update project fields, optionally guarded by the expected updatedAt.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      project: { type: "string", description: "Project name or UUID" },
      name: { type: "string" },
      description: { type: "string" },
      lead: USER_REF,
      startDate: { type: "string" },
      targetDate: { type: "string" },
      expectedUpdatedAt: EXPECTED_ARGS.expectedUpdatedAt
    },
    required: ["project"],
    additionalProperties: false
  },
  async run(client, args) {
    const reference = requiredString(args, "project");
    const id = await resolveProjectId(client, reference);
    const expectedUpdatedAt = optionalString(args, "expectedUpdatedAt");
    if (expectedUpdatedAt !== undefined) {
      const current = record(await request(client, PROJECT_GET, { id }), "project", "projectGet");
      const observed = text(current, "updatedAt", "project");
      if (observed !== expectedUpdatedAt) {
        throw new Error(`expected ${reference} updatedAt ${JSON.stringify(expectedUpdatedAt)}, observed ${JSON.stringify(observed)}`);
      }
    }
    const input = {};
    const name = optionalString(args, "name");
    if (name !== undefined)
      input.name = name;
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    const lead = optionalString(args, "lead");
    if (lead !== undefined)
      input.leadId = await resolveUserId(client, lead);
    const startDate = optionalString(args, "startDate");
    if (startDate !== undefined)
      input.startDate = startDate;
    const targetDate = optionalString(args, "targetDate");
    if (targetDate !== undefined)
      input.targetDate = targetDate;
    if (Object.keys(input).length === 0)
      throw new Error("no project fields to update");
    await mutateForId(client, PROJECT_UPDATE, { id, input }, "projectUpdate", "project");
    return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
  }
};
var projectGet = {
  name: "linear_project_get",
  description: "Fetch one project with its status, lead, teams and milestones.",
  tier: "read",
  parameters: {
    type: "object",
    properties: { project: { type: "string", description: "Project name or UUID" } },
    required: ["project"],
    additionalProperties: false
  },
  async run(client, args) {
    const id = await resolveProjectId(client, requiredString(args, "project"));
    return { project: record(await request(client, PROJECT_GET, { id }), "project", "projectGet") };
  }
};
var milestoneCreate = {
  name: "linear_milestone_create",
  description: "Create a milestone inside a project.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      project: { type: "string", description: "Project name or UUID" },
      name: { type: "string", minLength: 1 },
      description: { type: "string" },
      targetDate: { type: "string" }
    },
    required: ["project", "name"],
    additionalProperties: false
  },
  async run(client, args) {
    const projectId = await resolveProjectId(client, requiredString(args, "project"));
    const input = { projectId, name: requiredString(args, "name") };
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    const targetDate = optionalString(args, "targetDate");
    if (targetDate !== undefined)
      input.targetDate = targetDate;
    const id = await mutateForId(client, MILESTONE_CREATE, { input }, "projectMilestoneCreate", "projectMilestone");
    return {
      milestone: record(await request(client, MILESTONE_GET, { id }), "projectMilestone", "milestoneGet")
    };
  }
};
var milestoneUpdate = {
  name: "linear_milestone_update",
  description: "Update a project milestone; the milestone is resolved by name inside its project.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      project: { type: "string", description: "Project name or UUID; required unless milestone is a UUID" },
      milestone: { type: "string", description: "Milestone name or UUID" },
      name: { type: "string" },
      description: { type: "string" },
      targetDate: { type: "string" }
    },
    required: ["milestone"],
    additionalProperties: false
  },
  async run(client, args) {
    const milestone = requiredString(args, "milestone");
    const project = optionalString(args, "project");
    let id;
    if (UUID_PATTERN.test(milestone)) {
      id = milestone;
    } else {
      if (project === undefined) {
        throw new Error('argument "project" is required unless "milestone" is a UUID');
      }
      id = await resolveMilestoneId(client, await resolveProjectId(client, project), milestone);
    }
    const input = {};
    const name = optionalString(args, "name");
    if (name !== undefined)
      input.name = name;
    const description = optionalString(args, "description");
    if (description !== undefined)
      input.description = description;
    const targetDate = optionalString(args, "targetDate");
    if (targetDate !== undefined)
      input.targetDate = targetDate;
    if (Object.keys(input).length === 0)
      throw new Error("no milestone fields to update");
    await mutateForId(client, MILESTONE_UPDATE, { id, input }, "projectMilestoneUpdate", "projectMilestone");
    return {
      milestone: record(await request(client, MILESTONE_GET, { id }), "projectMilestone", "milestoneGet")
    };
  }
};
var STATE_TYPES = ["triage", "backlog", "unstarted", "started", "completed", "canceled"];
async function issueFilter(client, args) {
  const filter = {};
  const teamKey = optionalString(args, "teamKey");
  if (teamKey !== undefined)
    filter.team = { key: { eq: teamKey } };
  const state = {};
  const stateName = optionalString(args, "stateName");
  if (stateName !== undefined)
    state.name = { eq: stateName };
  const stateTypes = stringList(args, "stateTypes");
  if (stateTypes !== undefined)
    state.type = { in: stateTypes };
  if (Object.keys(state).length > 0)
    filter.state = state;
  const assignee = optionalString(args, "assignee");
  if (assignee !== undefined) {
    filter.assignee = assignee.toLowerCase() === "me" ? { isMe: { eq: true } } : { id: { eq: await resolveUserId(client, assignee) } };
  }
  const project = optionalString(args, "project");
  if (project !== undefined)
    filter.project = { id: { eq: await resolveProjectId(client, project) } };
  const priority = optionalNumber(args, "priority");
  if (priority !== undefined) {
    if (!Number.isInteger(priority) || priority < 0 || priority > 4) {
      throw new Error('argument "priority" must be an integer from 0 to 4');
    }
    filter.priority = { eq: priority };
  }
  const labels = stringList(args, "labels");
  if (labels !== undefined && labels.length > 0) {
    filter.labels = { some: { or: labels.map((name) => ({ name: { eqIgnoreCase: name } })) } };
  }
  const staleDays = optionalNumber(args, "staleDays");
  if (staleDays !== undefined) {
    if (!Number.isInteger(staleDays) || staleDays < 1) {
      throw new Error('argument "staleDays" must be an integer >= 1');
    }
    filter.updatedAt = { lt: `-P${staleDays}D` };
  }
  return Object.keys(filter).length === 0 ? null : filter;
}
var searchIssues = {
  name: "linear_issue_search",
  description: 'Search or list issues in one bounded page, filtered by team key, state, assignee ("me", name or UUID), project (name or UUID), priority, labels and staleness.',
  tier: "read",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Full-text query; omit to list issues by filter only" },
      teamKey: { type: "string", description: "Team key such as ABC" },
      stateName: { type: "string", description: "Workflow state name such as In Progress" },
      stateTypes: { type: "array", items: { type: "string", enum: STATE_TYPES } },
      assignee: USER_REF,
      project: { type: "string", description: "Project name or UUID" },
      priority: { type: "integer", minimum: 0, maximum: 4, description: "Exact priority: 0 none, 1 urgent, 2 high, 3 medium, 4 low" },
      labels: { type: "array", items: { type: "string" }, description: "Label names; an issue matches when it has any of them (case-insensitive)" },
      staleDays: { type: "integer", minimum: 1, description: "Only issues not updated in this many days" },
      first: { type: "integer", minimum: 1, maximum: 100, default: 25 },
      after: { type: "string", description: "Cursor from a previous pageInfo.endCursor" },
      includeArchived: { type: "boolean" }
    },
    additionalProperties: false
  },
  async run(client, args) {
    const query = optionalString(args, "query");
    const variables = {
      filter: await issueFilter(client, args),
      first: Math.min(optionalNumber(args, "first") ?? 25, 100),
      after: optionalString(args, "after") ?? null,
      includeArchived: args.includeArchived === true
    };
    const root = query === undefined ? "issues" : "searchIssues";
    const data = query === undefined ? await request(client, ISSUE_LIST, variables) : await request(client, ISSUE_SEARCH, { term: query, ...variables });
    return {
      nodes: connectionNodes(data, root),
      pageInfo: record(record(data, root, root), "pageInfo", root)
    };
  }
};
var projectStatusPost = {
  name: "linear_project_status_post",
  description: "Post a project status update with a health of onTrack, atRisk or offTrack; the project is a name or UUID.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      project: { type: "string", description: "Project name or UUID" },
      body: { type: "string", minLength: 1, description: "Markdown body of the update" },
      health: { type: "string", enum: ["onTrack", "atRisk", "offTrack"] }
    },
    required: ["project", "body", "health"],
    additionalProperties: false
  },
  async run(client, args) {
    const projectId = await resolveProjectId(client, requiredString(args, "project"));
    const input = { projectId, body: requiredString(args, "body"), health: requiredString(args, "health") };
    const id = await mutateForId(client, PROJECT_STATUS_POST, { input }, "projectUpdateCreate", "projectUpdate");
    return {
      projectUpdate: record(await request(client, PROJECT_STATUS_GET, { id }), "projectUpdate", "projectUpdateGet")
    };
  }
};
var issueLinkAdd = {
  name: "linear_issue_link_add",
  description: "Attach a URL such as a pull request or commit link to an issue given by UUID or identifier like ABC-12.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      issue: ISSUE_REF,
      url: { type: "string", minLength: 1 },
      title: { type: "string", description: "Link title; Linear derives one from the URL when omitted" }
    },
    required: ["issue", "url"],
    additionalProperties: false
  },
  async run(client, args, actorCtx) {
    const issueId = await resolveIssueId(client, requiredString(args, "issue"));
    const variables = { issueId, url: requiredString(args, "url") };
    const title = optionalString(args, "title");
    if (title !== undefined)
      variables.title = title;
    applyActorAttribution(variables, actorCtx);
    const id = await mutateForId(client, ISSUE_LINK_ADD, variables, "attachmentLinkURL", "attachment");
    return { attachment: record(await request(client, ATTACHMENT_GET, { id }), "attachment", "attachmentGet") };
  }
};
var DOCUMENT_REF = { type: "string", description: "Document UUID, slug ID or exact title" };
async function documentResult(client, id) {
  return { document: record(await request(client, DOCUMENT_GET, { id }), "document", "documentGet") };
}
var documentCreate = {
  name: "linear_document_create",
  description: "Create a markdown document, optionally attached to a project (name or UUID) or an issue (UUID or identifier).",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", minLength: 1 },
      content: { type: "string", description: "Markdown content" },
      project: { type: "string", description: "Project name or UUID" },
      issue: ISSUE_REF
    },
    required: ["title"],
    additionalProperties: false
  },
  async run(client, args) {
    const input = { title: requiredString(args, "title") };
    const content = optionalString(args, "content");
    if (content !== undefined)
      input.content = content;
    const project = optionalString(args, "project");
    if (project !== undefined)
      input.projectId = await resolveProjectId(client, project);
    const issue = optionalString(args, "issue");
    if (issue !== undefined)
      input.issueId = await resolveIssueId(client, issue);
    const id = await mutateForId(client, DOCUMENT_CREATE, { input }, "documentCreate", "document");
    return documentResult(client, id);
  }
};
var documentUpdate = {
  name: "linear_document_update",
  description: "Change the title or markdown content of a document given by UUID, slug ID or exact title.",
  tier: "write",
  parameters: {
    type: "object",
    properties: {
      document: DOCUMENT_REF,
      title: { type: "string", minLength: 1 },
      content: { type: "string", description: "Markdown content; replaces the whole document body" }
    },
    required: ["document"],
    additionalProperties: false
  },
  async run(client, args) {
    const input = {};
    const title = optionalString(args, "title");
    if (title !== undefined)
      input.title = title;
    const content = optionalString(args, "content");
    if (content !== undefined)
      input.content = content;
    if (Object.keys(input).length === 0)
      throw new Error('argument "title" or "content" is required');
    const id = await resolveDocumentId(client, requiredString(args, "document"));
    await mutateForId(client, DOCUMENT_UPDATE, { id, input }, "documentUpdate", "document");
    return documentResult(client, id);
  }
};
var documentGet = {
  name: "linear_document_get",
  description: "Fetch one document with its markdown content, given by UUID, slug ID or exact title.",
  tier: "read",
  parameters: {
    type: "object",
    properties: { document: DOCUMENT_REF },
    required: ["document"],
    additionalProperties: false
  },
  async run(client, args) {
    return documentResult(client, await resolveDocumentId(client, requiredString(args, "document")));
  }
};
var ergonomicOps = [
  issueCreate,
  issueUpdate,
  issueTransition,
  issueGet,
  issueCommentAdd,
  issueRelationAdd,
  issueLinkAdd,
  projectCreate,
  projectUpdate,
  projectGet,
  projectStatusPost,
  milestoneCreate,
  milestoneUpdate,
  searchIssues,
  documentCreate,
  documentUpdate,
  documentGet
];

// node_modules/@toon-format/toon/dist/index.mjs
var NULL_LITERAL = "null";
var DELIMITERS = {
  comma: ",",
  tab: "\t",
  pipe: "|"
};
var DEFAULT_DELIMITER = DELIMITERS.comma;
function escapeString(value) {
  return value.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`).replace(/\n/g, `\\n`).replace(/\r/g, `\\r`).replace(/\t/g, `\\t`).replace(/[\u0000-\u001F]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
var FETCH_LINE = Symbol("fetch-line");
function isBooleanOrNullLiteral(token) {
  return token === "true" || token === "false" || token === "null";
}
function setOwnProperty(target, key, value) {
  if (key === "__proto__") {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true
    });
    return;
  }
  target[key] = value;
}
var COMMENT_LINE_PATTERN = new RegExp(`(?:^\uFEFF?|\\n) *#`);
var RawString = class {
  constructor(value) {
    if (COMMENT_LINE_PATTERN.test(value))
      throw new TypeError(`Raw string must not contain a line starting with "#": ${JSON.stringify(value)}`);
    this.value = value;
  }
};
function isRawString(value) {
  return value instanceof RawString;
}
var SURROGATE_PATTERN = /[\uD800-\uDFFF]/;
function normalizeValue(value) {
  if (value === null)
    return null;
  if (isRawString(value))
    return value;
  if (typeof value === "object" && value !== null && "toJSON" in value && typeof value.toJSON === "function") {
    const next = value.toJSON();
    if (next !== value)
      return normalizeValue(next);
  }
  if (typeof value === "string") {
    assertNoLoneSurrogate(value, "string value");
    return value;
  }
  if (typeof value === "boolean")
    return value;
  if (typeof value === "number") {
    if (Object.is(value, -0))
      return 0;
    if (!Number.isFinite(value))
      return null;
    return value;
  }
  if (typeof value === "bigint") {
    if (value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER)
      return Number(value);
    return value.toString();
  }
  if (value instanceof Date)
    return value.toISOString();
  if (Array.isArray(value))
    return value.map(normalizeValue);
  if (value instanceof Set)
    return Array.from(value).map(normalizeValue);
  if (value instanceof Map)
    return Object.fromEntries(Array.from(value, ([k, v]) => [String(k), normalizeValue(v)]));
  if (isPlainObject(value)) {
    const encodedValues = {};
    for (const key in value)
      if (Object.hasOwn(value, key)) {
        assertNoLoneSurrogate(key, "object key");
        setOwnProperty(encodedValues, key, normalizeValue(value[key]));
      }
    return encodedValues;
  }
  return null;
}
function assertNoLoneSurrogate(value, context) {
  if (!SURROGATE_PATTERN.test(value))
    return;
  for (let index = 0;index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code < 55296 || code > 57343)
      continue;
    const isHighSurrogate = code <= 56319;
    const next = value.charCodeAt(index + 1);
    if (isHighSurrogate && next >= 56320 && next <= 57343) {
      index++;
      continue;
    }
    throw new TypeError(`Cannot encode ${context} containing an unpaired surrogate U+${code.toString(16).toUpperCase()} at index ${index}`);
  }
}
function isJsonPrimitive(value) {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isEncodablePrimitive(value) {
  return isJsonPrimitive(value) || isRawString(value);
}
function isJsonArray(value) {
  return Array.isArray(value);
}
function isJsonObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) && !isRawString(value);
}
function isEmptyObject(value) {
  return Object.keys(value).length === 0;
}
function isPlainObject(value) {
  if (value === null || typeof value !== "object")
    return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}
function isArrayOfPrimitives(value) {
  return value.length === 0 || value.every((item) => isEncodablePrimitive(item));
}
function isArrayOfArrays(value) {
  return value.length === 0 || value.every((item) => isJsonArray(item));
}
function isArrayOfObjects(value) {
  return value.length === 0 || value.every((item) => isJsonObject(item));
}
var NUMERIC_LIKE_PATTERN = /^[+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i;
function assertValidDelimiter(delimiter) {
  if (!Object.values(DELIMITERS).includes(delimiter))
    throw new TypeError(`Invalid delimiter ${JSON.stringify(delimiter)}. Valid delimiters are: comma (,), tab (\\t), pipe (|)`);
}
function isValidUnquotedKey(key) {
  return /^[A-Z_][\w.]*$/i.test(key);
}
function isSafeUnquoted(value, delimiter = DEFAULT_DELIMITER) {
  if (!value)
    return false;
  if (/^[ \t]|[ \t]$/.test(value))
    return false;
  if (isBooleanOrNullLiteral(value) || isNumericLike(value))
    return false;
  if (value.includes(":"))
    return false;
  if (value.includes('"') || value.includes("\\"))
    return false;
  if (/[[\]{}]/.test(value))
    return false;
  if (/[\u0000-\u001F]/.test(value))
    return false;
  if (value.includes(delimiter))
    return false;
  if (value.startsWith("-"))
    return false;
  if (value.startsWith("#"))
    return false;
  return true;
}
function isNumericLike(value) {
  return NUMERIC_LIKE_PATTERN.test(value);
}
function encodePrimitive(value, delimiter) {
  if (isRawString(value))
    return value.value;
  if (value === null)
    return NULL_LITERAL;
  if (typeof value === "boolean")
    return String(value);
  if (typeof value === "number")
    return String(value);
  return encodeStringLiteral(value, delimiter);
}
function encodeStringLiteral(value, delimiter = DEFAULT_DELIMITER) {
  if (isSafeUnquoted(value, delimiter))
    return value;
  return `"${escapeString(value)}"`;
}
function encodeKey(key) {
  if (isValidUnquotedKey(key))
    return key;
  return `"${escapeString(key)}"`;
}
function encodeAndJoinPrimitives(values, delimiter = DEFAULT_DELIMITER) {
  return values.map((v) => encodePrimitive(v, delimiter)).join(delimiter);
}
function formatHeader(length, options) {
  const key = options?.key;
  const fields = options?.fields;
  const delimiter = options?.delimiter ?? ",";
  let header = "";
  if (key != null)
    header += encodeKey(key);
  header += `[${length}${options?.keyed ? ":" : ""}${delimiter !== DEFAULT_DELIMITER ? delimiter : ""}]`;
  if (fields)
    header += `{${formatFieldSegment(fields, delimiter)}}`;
  header += ":";
  return header;
}
function formatFieldSegment(fields, delimiter) {
  return fields.map((field) => encodeKey(field.name) + (field.children ? `{${formatFieldSegment(field.children, delimiter)}}` : "")).join(delimiter);
}
function extractTabularFields(rows) {
  if (rows.length === 0)
    return;
  const firstKeys = Object.keys(rows[0]);
  if (firstKeys.length === 0)
    return;
  for (const row of rows) {
    if (Object.keys(row).length !== firstKeys.length)
      return;
    for (const key of firstKeys)
      if (!Object.hasOwn(row, key))
        return;
  }
  const fieldNodes = [];
  for (const key of firstKeys) {
    const fieldNode = classifyColumn(key, rows.map((row) => row[key]));
    if (!fieldNode)
      return;
    fieldNodes.push(fieldNode);
  }
  return fieldNodes;
}
function extractKeyedTabularFields(value) {
  const entryValues = Object.values(value);
  if (entryValues.length < 2)
    return;
  if (!entryValues.every((entryValue) => isJsonObject(entryValue) && !isEmptyObject(entryValue)))
    return;
  return extractTabularFields(entryValues);
}
function collectRowLeaves(row, fields) {
  const leaves = [];
  collectLeafValues(row, fields, leaves);
  return leaves;
}
function classifyColumn(name, values) {
  if (values.every((value) => isEncodablePrimitive(value)))
    return { name };
  if (!values.every((value) => isJsonObject(value) && !isEmptyObject(value)))
    return;
  const children = extractTabularFields(values);
  if (!children)
    return;
  return {
    name,
    children
  };
}
function collectLeafValues(row, fields, leaves) {
  for (const field of fields) {
    const value = row[field.name];
    if (field.children)
      collectLeafValues(value, field.children, leaves);
    else
      leaves.push(value);
  }
}
function* encodeJsonValue(value, options, depth) {
  if (isEncodablePrimitive(value)) {
    const encodedPrimitive = encodePrimitive(value, options.delimiter);
    if (encodedPrimitive !== "")
      yield encodedPrimitive;
    return;
  }
  if (isJsonArray(value))
    yield* encodeArrayLines(undefined, value, depth, options);
  else if (isJsonObject(value)) {
    const keyedFields = extractKeyedTabularFields(value);
    if (keyedFields) {
      yield* encodeKeyedObjectLines(undefined, value, keyedFields, depth, options);
      return;
    }
    yield* encodeObjectLines(value, depth, options);
  }
}
function* encodeObjectLines(value, depth, options) {
  for (const [key, val] of Object.entries(value))
    yield* encodeKeyValuePairLines(key, val, depth, options);
}
function* encodeKeyValuePairLines(key, value, depth, options) {
  const encodedKey = encodeKey(key);
  if (isEncodablePrimitive(value))
    yield indentedLine(depth, `${encodedKey}: ${encodePrimitive(value, options.delimiter)}`, options.indentSize);
  else if (isJsonArray(value))
    yield* encodeArrayLines(key, value, depth, options);
  else if (isJsonObject(value)) {
    const keyedFields = extractKeyedTabularFields(value);
    if (keyedFields) {
      yield* encodeKeyedObjectLines(key, value, keyedFields, depth, options);
      return;
    }
    yield indentedLine(depth, `${encodedKey}:`, options.indentSize);
    if (!isEmptyObject(value))
      yield* encodeObjectLines(value, depth + 1, options);
  }
}
function* encodeKeyedObjectLines(key, value, fields, depth, options) {
  const entries = Object.entries(value);
  yield indentedLine(depth, formatHeader(entries.length, {
    key,
    fields,
    delimiter: options.delimiter,
    keyed: true
  }), options.indentSize);
  yield* encodeKeyedEntryRowsLines(entries, fields, depth + 1, options);
}
function* encodeKeyedEntryRowsLines(entries, fields, depth, options) {
  for (const [entryKey, entryValue] of entries) {
    const leaves = collectRowLeaves(entryValue, fields);
    yield indentedLine(depth, `${encodeKey(entryKey)}: ${encodeAndJoinPrimitives(leaves, options.delimiter)}`, options.indentSize);
  }
}
function* encodeArrayLines(key, value, depth, options) {
  if (value.length === 0) {
    yield indentedLine(depth, key != null ? `${encodeKey(key)}: []` : "[]", options.indentSize);
    return;
  }
  if (isArrayOfPrimitives(value)) {
    yield indentedLine(depth, encodeInlineArrayLine(value, options.delimiter, key), options.indentSize);
    return;
  }
  if (isArrayOfArrays(value)) {
    if (value.every((arr) => isArrayOfPrimitives(arr))) {
      yield* encodeArrayOfArraysAsListItemsLines(key, value, depth, options);
      return;
    }
  }
  if (isArrayOfObjects(value)) {
    const fields = extractTabularFields(value);
    if (fields)
      yield* encodeArrayOfObjectsAsTabularLines(key, value, fields, depth, options);
    else
      yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
    return;
  }
  yield* encodeMixedArrayAsListItemsLines(key, value, depth, options);
}
function* encodeArrayOfArraysAsListItemsLines(prefix, values, depth, options) {
  yield indentedLine(depth, formatHeader(values.length, {
    key: prefix,
    delimiter: options.delimiter
  }), options.indentSize);
  for (const arr of values)
    if (isArrayOfPrimitives(arr)) {
      const arrayLine = encodeInlineArrayLine(arr, options.delimiter);
      yield indentedListItem(depth + 1, arrayLine, options.indentSize);
    }
}
function encodeInlineArrayLine(values, delimiter, prefix) {
  const header = formatHeader(values.length, {
    key: prefix,
    delimiter
  });
  const joinedValue = encodeAndJoinPrimitives(values, delimiter);
  if (values.length === 0)
    return header;
  return `${header} ${joinedValue}`;
}
function* encodeArrayOfObjectsAsTabularLines(prefix, rows, fields, depth, options) {
  yield indentedLine(depth, formatHeader(rows.length, {
    key: prefix,
    fields,
    delimiter: options.delimiter
  }), options.indentSize);
  yield* writeTabularRowsLines(rows, fields, depth + 1, options);
}
function* writeTabularRowsLines(rows, fields, depth, options) {
  for (const row of rows)
    yield indentedLine(depth, encodeAndJoinPrimitives(collectRowLeaves(row, fields), options.delimiter), options.indentSize);
}
function* encodeMixedArrayAsListItemsLines(prefix, items, depth, options) {
  yield indentedLine(depth, formatHeader(items.length, {
    key: prefix,
    delimiter: options.delimiter
  }), options.indentSize);
  for (const item of items)
    yield* encodeListItemValueLines(item, depth + 1, options);
}
function* encodeObjectAsListItemLines(obj, depth, options) {
  if (isEmptyObject(obj)) {
    yield indentedLine(depth, "-", options.indentSize);
    return;
  }
  const entries = Object.entries(obj);
  const [firstKey, firstValue] = entries[0];
  const restEntries = entries.slice(1);
  if (isJsonArray(firstValue) && isArrayOfObjects(firstValue)) {
    const fields = extractTabularFields(firstValue);
    if (fields) {
      yield indentedListItem(depth, formatHeader(firstValue.length, {
        key: firstKey,
        fields,
        delimiter: options.delimiter
      }), options.indentSize);
      yield* writeTabularRowsLines(firstValue, fields, depth + 2, options);
      if (restEntries.length > 0)
        yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
      return;
    }
  }
  if (isJsonObject(firstValue)) {
    const keyedFields = extractKeyedTabularFields(firstValue);
    if (keyedFields) {
      const keyedEntries = Object.entries(firstValue);
      yield indentedListItem(depth, formatHeader(keyedEntries.length, {
        key: firstKey,
        fields: keyedFields,
        delimiter: options.delimiter,
        keyed: true
      }), options.indentSize);
      yield* encodeKeyedEntryRowsLines(keyedEntries, keyedFields, depth + 2, options);
      if (restEntries.length > 0)
        yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
      return;
    }
  }
  const encodedKey = encodeKey(firstKey);
  if (isEncodablePrimitive(firstValue))
    yield indentedListItem(depth, `${encodedKey}: ${encodePrimitive(firstValue, options.delimiter)}`, options.indentSize);
  else if (isJsonArray(firstValue))
    if (firstValue.length === 0)
      yield indentedListItem(depth, `${encodedKey}: []`, options.indentSize);
    else if (isArrayOfPrimitives(firstValue))
      yield indentedListItem(depth, `${encodedKey}${encodeInlineArrayLine(firstValue, options.delimiter)}`, options.indentSize);
    else {
      yield indentedListItem(depth, `${encodedKey}${formatHeader(firstValue.length, { delimiter: options.delimiter })}`, options.indentSize);
      for (const item of firstValue)
        yield* encodeListItemValueLines(item, depth + 2, options);
    }
  else if (isJsonObject(firstValue)) {
    yield indentedListItem(depth, `${encodedKey}:`, options.indentSize);
    if (!isEmptyObject(firstValue))
      yield* encodeObjectLines(firstValue, depth + 2, options);
  }
  if (restEntries.length > 0)
    yield* encodeObjectLines(Object.fromEntries(restEntries), depth + 1, options);
}
function* encodeListItemValueLines(value, depth, options) {
  if (isEncodablePrimitive(value))
    yield indentedListItem(depth, encodePrimitive(value, options.delimiter), options.indentSize);
  else if (isJsonArray(value))
    if (isArrayOfPrimitives(value))
      yield indentedListItem(depth, encodeInlineArrayLine(value, options.delimiter), options.indentSize);
    else {
      yield indentedListItem(depth, formatHeader(value.length, { delimiter: options.delimiter }), options.indentSize);
      for (const item of value)
        yield* encodeListItemValueLines(item, depth + 1, options);
    }
  else if (isJsonObject(value))
    yield* encodeObjectAsListItemLines(value, depth, options);
}
function indentedLine(depth, content, indentSize) {
  return " ".repeat(indentSize * depth) + content;
}
function indentedListItem(depth, content, indentSize) {
  return indentedLine(depth, "- " + content, indentSize);
}
function applyReplacer(root, replacer) {
  const replacedRoot = replacer("", root, []);
  if (replacedRoot === undefined)
    return transformChildren(root, replacer, []);
  return transformReplaced(root, replacedRoot, replacer, []);
}
function transformReplaced(original, replaced, replacer, path) {
  if (isRawString(replaced) && !isEncodablePrimitive(original))
    return transformChildren(original, replacer, path);
  return transformChildren(normalizeValue(replaced), replacer, path);
}
function transformChildren(value, replacer, path) {
  if (isJsonObject(value))
    return transformObject(value, replacer, path);
  if (isJsonArray(value))
    return transformArray(value, replacer, path);
  return value;
}
function transformObject(obj, replacer, path) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const childPath = [...path, key];
    const replacedValue = replacer(key, value, childPath);
    if (replacedValue === undefined)
      continue;
    setOwnProperty(result, key, transformReplaced(value, replacedValue, replacer, childPath));
  }
  return result;
}
function transformArray(arr, replacer, path) {
  const result = [];
  for (let i = 0;i < arr.length; i++) {
    const value = arr[i];
    const childPath = [...path, i];
    const replacedValue = replacer(String(i), value, childPath);
    if (replacedValue === undefined)
      continue;
    result.push(transformReplaced(value, replacedValue, replacer, childPath));
  }
  return result;
}
function encode(input, options) {
  return Array.from(encodeLines(input, options)).join(`
`);
}
function encodeLines(input, options) {
  const normalizedValue = normalizeValue(input);
  const resolvedOptions = resolveOptions(options);
  return encodeJsonValue(resolvedOptions.replacer ? applyReplacer(normalizedValue, resolvedOptions.replacer) : normalizedValue, resolvedOptions, 0);
}
function resolveOptions(options) {
  const delimiter = options?.delimiter ?? DEFAULT_DELIMITER;
  assertValidDelimiter(delimiter);
  return {
    indentSize: options?.indentSize ?? options?.indent ?? 2,
    delimiter,
    replacer: options?.replacer
  };
}
// src/output/policy.json
var policy_default = {
  source: "test/fixtures/toon-token-policy.json",
  minMedianSaving: 0.15,
  tokenizers: [
    "o200k_base",
    "cl100k_base"
  ],
  pageSizes: [
    1,
    2,
    3,
    5,
    10,
    25,
    50
  ],
  decisions: {
    table: "toon",
    "keyed-table": "toon",
    object: "json",
    nested: "json",
    scalar: "json"
  },
  minRows: {
    table: 3,
    "keyed-table": 25,
    object: null,
    nested: null,
    scalar: null
  }
};

// src/output/encode.ts
var POLICY = policy_default.decisions;
var MIN_ROWS = policy_default.minRows;
function isPrimitive(value) {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isTable(value) {
  if (!Array.isArray(value) || value.length === 0)
    return false;
  let keys;
  for (const row of value) {
    if (row === null || typeof row !== "object" || Array.isArray(row))
      return false;
    const rowKeys = Object.keys(row).join("\x00");
    if (keys === undefined)
      keys = rowKeys;
    else if (rowKeys !== keys)
      return false;
    if (!Object.values(row).every(isPrimitive))
      return false;
  }
  return true;
}
function analyzeShape(value) {
  if (value === undefined || isPrimitive(value))
    return "scalar";
  if (isTable(value))
    return "table";
  if (Array.isArray(value))
    return "nested";
  const entries = Object.values(value);
  if (entries.every(isPrimitive))
    return "object";
  if (entries.every((entry) => isPrimitive(entry) || isTable(entry)) && entries.some(isTable))
    return "keyed-table";
  return "nested";
}
function tableRows(shape, value) {
  if (shape === "table")
    return value.length;
  if (shape !== "keyed-table")
    return 0;
  let rows = 0;
  for (const entry of Object.values(value))
    if (isTable(entry))
      rows = Math.max(rows, entry.length);
  return rows;
}
function encodeOutput(value) {
  const shape = analyzeShape(value);
  const minRows = MIN_ROWS[shape];
  if (POLICY[shape] === "toon" && minRows !== null && tableRows(shape, value) >= minRows) {
    try {
      const toon = encode(value);
      return { text: toon, format: "toon", shape, bytes: Buffer.byteLength(toon, "utf8") };
    } catch {}
  }
  const json = JSON.stringify(value, null, 0) ?? "null";
  return { text: json, format: "json", shape, bytes: Buffer.byteLength(json, "utf8") };
}

// node_modules/@oh-my-pi/omptype/src/errors.ts
function format(override, context, fallback) {
  return typeof override === "function" ? override(context) : override ?? fallback;
}

class OmpError {
  path;
  data;
  #rawExpected;
  #config;
  constructor(path, expected, data, config) {
    this.path = path;
    this.data = data;
    this.#rawExpected = expected;
    this.#config = config;
  }
  prefix(key) {
    this.path.unshift(key);
    return this;
  }
  configure(config) {
    this.#config = { ...this.#config, ...config };
    return this;
  }
  get code() {
    return errorCode(this.#rawExpected, this.data);
  }
  #context(expected, actual, problem = "") {
    const { description, rule } = describeExpectation(this.#rawExpected);
    return {
      code: this.code,
      path: this.path,
      propString: formatPath(this.path),
      data: this.data,
      expected,
      actual,
      problem,
      description,
      ...rule === undefined ? {} : { rule }
    };
  }
  get expected() {
    const actual = describeValue(this.data, this.#config?.preserveActual ? "predicate" : this.code);
    const parts = this.#rawExpected.split(" or ");
    const fallback = parts.length < 3 ? this.#rawExpected : `${parts.slice(0, -1).join(", ")} or ${parts[parts.length - 1]}`;
    return format(this.#config?.expected, this.#context(fallback, actual), fallback);
  }
  get actual() {
    const actual = describeValue(this.data, this.#config?.preserveActual ? "predicate" : this.code);
    const override = this.#config?.actual;
    return typeof override === "function" ? override(this.data) : override ?? actual;
  }
  get problem() {
    const expected = this.expected;
    const actual = this.actual;
    const fallback = this.data === MISSING ? `must be ${expected} (was missing)` : actual === "" ? `must be ${expected}` : `must be ${expected} (was ${actual})`;
    return format(this.#config?.problem, this.#context(expected, actual, fallback), fallback);
  }
  get message() {
    const expected = this.expected;
    const actual = this.actual;
    const problem = this.problem;
    const at = this.path.length === 0 ? "" : `${formatPath(this.path)} `;
    const messageActual = this.#config?.actual === undefined ? describeKind(this.data) : actual;
    return format(this.#config?.message, this.#context(expected, messageActual, problem), `${at}${problem}`);
  }
  toString() {
    return this.message;
  }
}
var MISSING = Symbol("omptype.missing");
function stringifyValue2(data) {
  const seen = new WeakSet;
  return JSON.stringify(data, (_key, value) => {
    if (typeof value !== "object" || value === null)
      return value;
    if (seen.has(value))
      return "(cycle)";
    seen.add(value);
    return value;
  }) ?? "an object";
}
function describeValue(data, code) {
  if (data === MISSING)
    return "missing";
  if (code === "undeclared")
    return "";
  if (code === "referenceSame")
    return "";
  if (code === "domain")
    return describeKind(data);
  if (data === null)
    return "null";
  if (Array.isArray(data))
    return "an array";
  switch (typeof data) {
    case "string":
      return data.length <= 40 ? JSON.stringify(data) : `a string (length ${data.length})`;
    case "number":
      return String(data);
    case "bigint":
      return `${data}n`;
    case "boolean":
      return String(data);
    case "undefined":
      return "undefined";
    case "object":
      return stringifyValue2(data);
    case "function":
      return "a function";
    default:
      return "a symbol";
  }
}
function describeKind(data) {
  if (data === MISSING)
    return "missing";
  if (typeof data === "number" && Number.isNaN(data))
    return "NaN";
  if (data === null)
    return "null";
  if (Array.isArray(data))
    return "an object";
  switch (typeof data) {
    case "string":
      return "a string";
    case "number":
      return "a number";
    case "bigint":
      return "a bigint";
    case "boolean":
      return "boolean";
    case "undefined":
      return "undefined";
    case "object": {
      const ctor = Object.getPrototypeOf(data)?.constructor;
      return typeof ctor?.name === "string" && ctor.name !== "Object" ? ctor.name : "an object";
    }
    case "function":
      return "a function";
    default:
      return "a symbol";
  }
}
function describeExpectation(expected) {
  const divisor = /divisible by (\d+(?:\.\d+)?)/.exec(expected);
  if (divisor) {
    const rule = Number(divisor[1]);
    return { description: rule === 2 ? "even" : `divisible by ${rule}`, rule };
  }
  return { description: expected.replace(/^(?:an?|the) /, "") };
}
function formatPath(path) {
  let out = "";
  for (const key of path) {
    if (typeof key === "number")
      out += `[${key}]`;
    else if (typeof key === "symbol")
      out += `[${String(key)}]`;
    else
      out += out.length === 0 ? key : `.${key}`;
  }
  return out;
}
function errorCode(expected, data) {
  if (data === MISSING)
    return "required";
  if (expected === "removed")
    return "undeclared";
  if (expected.includes("serialized to the same value"))
    return "referenceSame";
  if (expected.includes("divisible by") || expected.includes("integer"))
    return "divisor";
  if (expected === "true" || expected === "false" || expected === "null" || expected === "undefined" || expected === "NaN" || expected === "Infinity" || expected === "-Infinity" || /^-?\d+(?:\.\d+)?n?$/.test(expected) || expected.includes(" or ") && expected.split(" or ").every((part) => /^".*"$|^-?\d+(?:\.\d+)?n?$|^(?:true|false|null|undefined)$/.test(part))) {
    return "unit";
  }
  if (expected.includes("at least") || expected.includes("more than") || expected.includes("timestamp after") || expected === "non-negative" || expected === "positive") {
    return "min";
  }
  if (expected.includes("at most") || expected.includes("less than") || expected.includes("timestamp before") || expected === "non-positive" || expected === "negative") {
    return "max";
  }
  if (expected.includes("matching") || expected.includes("format") || expected.includes("email") || expected.includes("parsable") || expected.includes("only digits")) {
    return "pattern";
  }
  if (expected.includes("predicate") || expected.includes("satisfying") || expected.includes("according to"))
    return "predicate";
  if (expected.startsWith('"') || expected.startsWith("the date "))
    return "unit";
  if (expected === "an Error" || expected === "a Date" || expected.startsWith("an instance of "))
    return "domain";
  if (expected.includes(" or ") && !expected.includes("IPv") || expected.endsWith(" instance") || expected.startsWith("a number representing") || [
    "a string",
    "a number",
    "a bigint",
    "a symbol",
    "boolean",
    "an object",
    "an array",
    "a tuple",
    "undefined",
    "null",
    "unknown",
    "never"
  ].includes(expected))
    return "domain";
  return "predicate";
}

class OmpErrors {
  #path;
  #expected;
  #data;
  #entry;
  #entries;
  #config;
  #separator = `
`;
  constructor(path, expected, data, config) {
    this.#path = path;
    this.#expected = expected;
    this.#data = data;
    this.#config = config;
  }
  get length() {
    return this.#entries?.length ?? 1;
  }
  get 0() {
    return this.#entries?.[0] ?? this.#getEntry();
  }
  static single(path, expected, data, config) {
    return new OmpErrors(path, expected, data, config);
  }
  #getEntry() {
    if (this.#entry)
      return this.#entry;
    const path = this.#path === undefined ? [] : Array.isArray(this.#path) ? [...this.#path] : [this.#path];
    const entry = new OmpError(path, this.#expected, this.#data, this.#config);
    this.#entry = entry;
    return entry;
  }
  append(other) {
    this.#entries ??= [this.#getEntry()];
    const entries = this.#entries;
    for (const entry of other)
      entries.push(entry);
    return this;
  }
  prefix(key) {
    if (this.#entries) {
      for (const entry of this.#entries)
        entry.prefix(key);
    } else {
      const path = this.#path;
      this.#path = path === undefined ? [key] : Array.isArray(path) ? [key, ...path] : [key, path];
      this.#entry = undefined;
    }
    return this;
  }
  configure(config) {
    if (this.#entries) {
      for (const entry of this.#entries)
        entry.configure(config);
    } else {
      this.#config = { ...this.#config, ...config };
      this.#entry = undefined;
    }
    return this;
  }
  get byPath() {
    const result = {};
    for (const entry of this)
      result[entry.path.map(String).join(".")] = entry;
    return result;
  }
  map(fn) {
    const result = [];
    let index = 0;
    for (const entry of this)
      result.push(fn(entry, index++, this));
    return result;
  }
  filter(fn) {
    const result = [];
    let index = 0;
    for (const entry of this) {
      if (fn(entry, index++, this))
        result.push(entry);
    }
    return result;
  }
  *[Symbol.iterator]() {
    if (this.#entries) {
      yield* this.#entries;
    } else {
      yield this.#getEntry();
    }
  }
  asAlternatives() {
    this.#separator = " or ";
    return this;
  }
  get summary() {
    const entries = [...this];
    if (this.#separator === `
` && entries.length > 1 && entries.every((entry) => Object.is(entry.data, entries[0].data) && entry.path.length === entries[0].path.length && entry.path.every((key, index) => key === entries[0].path[index]))) {
      const at = formatPath(entries[0].path);
      const actual = typeof entries[0].data === "string" ? JSON.stringify(entries[0].data) : String(entries[0].data);
      return `${at}${at === "" ? "" : " "}(${actual}) must be...
${entries.map((entry) => `  \u25E6 ${entry.expected}`).join(`
`)}`;
    }
    return entries.map((error) => error.message).join(this.#separator);
  }
  toString() {
    return this.summary;
  }
  throw() {
    throw new TraversalError(this);
  }
}

class TraversalError extends Error {
  errors;
  constructor(errors) {
    super(errors.summary);
    this.errors = errors;
    this.name = "TraversalError";
  }
}

class OmpTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = "OmpTypeError";
  }
}
// node_modules/@oh-my-pi/omptype/src/keywords.ts
var NUMERIC = /^(?:(?!^-0\.?0*$)(?:-?(?:(?:0|[1-9]\d*)(?:\.\d+)?)|\.\d+?))$/;
var INTEGER = /^[+-]?(?:0|[1-9]\d*)$/;
var EMAIL = /^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/;
var SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;
var UUID = /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;
var IPV4_SEGMENT = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
var IPV4_ADDRESS = `(?:${IPV4_SEGMENT}[.]){3}${IPV4_SEGMENT}`;
var IPV4 = new RegExp(`^${IPV4_ADDRESS}$`);
var IPV6_SEGMENT = "(?:[0-9a-fA-F]{1,4})";
var IPV6 = new RegExp("^(" + `(?:${IPV6_SEGMENT}:){7}(?:${IPV6_SEGMENT}|:)|` + `(?:${IPV6_SEGMENT}:){6}(?:${IPV4_ADDRESS}|:${IPV6_SEGMENT}|:)|` + `(?:${IPV6_SEGMENT}:){5}(?::${IPV4_ADDRESS}|(:${IPV6_SEGMENT}){1,2}|:)|` + `(?:${IPV6_SEGMENT}:){4}(?:(:${IPV6_SEGMENT}){0,1}:${IPV4_ADDRESS}|(:${IPV6_SEGMENT}){1,3}|:)|` + `(?:${IPV6_SEGMENT}:){3}(?:(:${IPV6_SEGMENT}){0,2}:${IPV4_ADDRESS}|(:${IPV6_SEGMENT}){1,4}|:)|` + `(?:${IPV6_SEGMENT}:){2}(?:(:${IPV6_SEGMENT}){0,3}:${IPV4_ADDRESS}|(:${IPV6_SEGMENT}){1,5}|:)|` + `(?:${IPV6_SEGMENT}:){1}(?:(:${IPV6_SEGMENT}){0,4}:${IPV4_ADDRESS}|(:${IPV6_SEGMENT}){1,6}|:)|` + `(?::((?::${IPV6_SEGMENT}){0,5}:${IPV4_ADDRESS}|(?::${IPV6_SEGMENT}){1,7}|:))` + ")(?:%[\\d.A-Za-z]{1,})?$");
var ISO_DATE = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))(T((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
function pattern(regex, expected, format) {
  return {
    k: "refine",
    base: { k: "string" },
    pred: (value) => {
      regex.lastIndex = 0;
      return regex.test(value);
    },
    expected,
    json: format === undefined ? { pattern: regex.source } : { pattern: regex.source, format }
  };
}
function morph(input, fn, out) {
  return { k: "morph", input, fn: (value, context) => fn(value, context), out };
}
function parsableJson() {
  return {
    k: "refine",
    base: { k: "string" },
    pred: (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    expected: "a JSON string",
    json: { contentMediaType: "application/json" }
  };
}
function parsableDate(expected = "a parsable date") {
  return {
    k: "refine",
    base: { k: "string" },
    pred: (value) => !Number.isNaN(new Date(value).valueOf()),
    expected,
    json: { format: "date-time" }
  };
}
function normalize(form) {
  return morph({ k: "string" }, (value) => value.normalize(form), patternForNormalized(form));
}
function patternForNormalized(form) {
  return {
    k: "refine",
    base: { k: "string" },
    pred: (value) => value.normalize(form) === value,
    expected: `${form}-normalized unicode`
  };
}
function uuidVersion(version) {
  return pattern(new RegExp(`^[\\da-f]{8}-[\\da-f]{4}-${version}[\\da-f]{3}-[89ab][\\da-f]{3}-[\\da-f]{12}$`, "i"), `a UUIDv${version}`, "uuid");
}
function isLuhnValid(input) {
  const value = input.replace(/[ -]+/g, "");
  let sum = 0;
  let double = false;
  for (let index = value.length - 1;index >= 0; index--) {
    let digit = Number(value[index]);
    if (double) {
      digit *= 2;
      if (digit > 9)
        digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return value.length > 0 && sum % 10 === 0;
}
function finiteNumber(expected = "a number") {
  return {
    k: "refine",
    base: { k: "unknown" },
    pred: (value) => typeof value === "number" && !Number.isNaN(value),
    expected
  };
}
function jsonObject() {
  const value = {};
  const resolveValue = () => value.current;
  const object = {
    k: "object",
    props: [],
    index: { k: "alias", name: "$jsonValue", resolve: resolveValue },
    extras: "keep"
  };
  const array = {
    k: "array",
    el: { k: "alias", name: "$jsonValue", resolve: resolveValue },
    desc: "an object"
  };
  value.current = {
    k: "union",
    members: [
      object,
      array,
      { k: "number" },
      { k: "string" },
      { k: "lit", v: false },
      { k: "null" },
      { k: "lit", v: true }
    ]
  };
  return object;
}
function instance(ctor, name) {
  return { k: "instance", ctor, expected: `${/^[AEIOU]/.test(name) ? "an" : "a"} ${name} instance` };
}
var keywordFactories = {
  string: () => ({ k: "string" }),
  Key: () => ({ k: "union", members: [{ k: "string" }, { k: "symbol" }] }),
  "unknown.any": () => ({ k: "unknown" }),
  Array: () => ({ k: "array", el: { k: "unknown" } }),
  Function: () => instance(Function, "Function"),
  RegExp: () => instance(RegExp, "RegExp"),
  File: () => instance(File, "File"),
  Error: () => instance(Error, "Error"),
  Set: () => instance(Set, "Set"),
  Map: () => instance(Map, "Map"),
  WeakSet: () => instance(WeakSet, "WeakSet"),
  WeakMap: () => instance(WeakMap, "WeakMap"),
  Promise: () => instance(Promise, "Promise"),
  FormData: () => instance(FormData, "FormData"),
  "FormData.parse": () => ({
    k: "morph",
    input: instance(FormData, "FormData"),
    fn: (value) => {
      const out = {};
      for (const [key, entry] of value.entries()) {
        const current = out[key];
        out[key] = current === undefined ? entry : Array.isArray(current) ? [...current, entry] : [current, entry];
      }
      return out;
    },
    out: { k: "object", props: [], index: { k: "unknown" }, extras: "keep" }
  }),
  "object.json": jsonObject,
  "object.json.stringify": () => ({
    k: "morph",
    input: jsonObject(),
    fn: (value) => JSON.stringify(value),
    out: { k: "string" }
  }),
  "number.epoch": () => ({
    k: "refine",
    base: {
      k: "refine",
      base: {
        k: "refine",
        base: finiteNumber("a number representing a Unix timestamp"),
        pred: (value) => Number.isInteger(value),
        expected: "an integer representing a Unix timestamp"
      },
      pred: (value) => value >= -8640000000000000,
      expected: "a Unix timestamp after -8640000000000000"
    },
    pred: (value) => value <= 8640000000000000,
    expected: "a Unix timestamp before 8640000000000000"
  }),
  "number.safe": () => ({
    k: "refine",
    base: {
      k: "refine",
      base: finiteNumber(),
      pred: (value) => value >= Number.MIN_SAFE_INTEGER,
      expected: `at least ${Number.MIN_SAFE_INTEGER}`
    },
    pred: (value) => value <= Number.MAX_SAFE_INTEGER,
    expected: `at most ${Number.MAX_SAFE_INTEGER}`
  }),
  "number.NaN": () => ({
    k: "refine",
    base: { k: "unknown" },
    pred: Number.isNaN,
    expected: "NaN"
  }),
  "number.Infinity": () => ({ k: "lit", v: Number.POSITIVE_INFINITY }),
  "number.NegativeInfinity": () => ({ k: "lit", v: Number.NEGATIVE_INFINITY }),
  "string.alpha": () => pattern(/^[A-Za-z]*$/, "only letters"),
  "string.alphanumeric": () => pattern(/^[\dA-Za-z]*$/, "only letters and digits 0-9"),
  "string.hex": () => pattern(/^[\dA-Fa-f]+$/, "hex characters only"),
  "string.base64": () => pattern(/^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/, "base64-encoded"),
  "string.base64.url": () => pattern(/^(?:[\w-]{4})*(?:[\w-]{2}(?:==|%3D%3D)?|[\w-]{3}(?:=|%3D)?)?$/, "base64url-encoded"),
  "string.capitalize": () => morph({ k: "string" }, (value) => value.charAt(0).toUpperCase() + value.slice(1)),
  "string.capitalize.preformatted": () => pattern(/^[A-Z].*$/, "capitalized"),
  "string.creditCard": () => ({
    k: "refine",
    base: pattern(/^(?:4\d{12}(?:\d{3,6})?|5[1-5]\d{14}|3[47]\d{13}|6(?:011|5\d\d)\d{12,15})$/, "a credit card number"),
    pred: (value) => isLuhnValid(value),
    expected: "a credit card number"
  }),
  "string.date": () => parsableDate(),
  "string.date.parse": () => morph(parsableDate(), (value) => new Date(value), { k: "instance", ctor: Date, expected: "a Date" }),
  "string.date.iso": () => pattern(ISO_DATE, "an ISO 8601 date", "date-time"),
  "string.date.iso.parse": () => morph(pattern(ISO_DATE, "an ISO 8601 date", "date-time"), (value) => new Date(value), {
    k: "instance",
    ctor: Date,
    expected: "a Date"
  }),
  "string.date.epoch": () => pattern(INTEGER, "an integer string representing a Unix timestamp"),
  "string.date.epoch.parse": () => morph(pattern(INTEGER, "an integer string representing a Unix timestamp"), (value) => new Date(Number(value)), {
    k: "instance",
    ctor: Date,
    expected: "a Date"
  }),
  "string.digits": () => pattern(/^\d*$/, "only digits 0-9"),
  "string.email": () => pattern(EMAIL, "an email address", "email"),
  "string.integer": () => pattern(INTEGER, "a well-formed integer string"),
  "string.integer.parse": () => morph(pattern(INTEGER, "a well-formed integer string"), (value, context) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) ? parsed : context.error("a safe integer string");
  }, { k: "number", int: true }),
  "string.ip": () => ({
    k: "union",
    members: [pattern(IPV4, "an IPv4 address", "ipv4"), pattern(IPV6, "an IPv6 address", "ipv6")]
  }),
  "string.ip.v4": () => pattern(IPV4, "an IPv4 address", "ipv4"),
  "string.ip.v6": () => pattern(IPV6, "an IPv6 address", "ipv6"),
  "string.json": () => parsableJson(),
  "string.json.parse": () => morph(parsableJson(), (value, context) => {
    try {
      return JSON.parse(value);
    } catch {
      return context.error("a JSON string");
    }
  }),
  "string.lower": () => morph({ k: "string" }, (value) => value.toLowerCase()),
  "string.lower.preformatted": () => pattern(/^[a-z]*$/, "only lowercase letters"),
  "string.normalize": () => normalize("NFC"),
  "string.normalize.NFC": () => normalize("NFC"),
  "string.normalize.NFC.preformatted": () => patternForNormalized("NFC"),
  "string.normalize.NFD": () => normalize("NFD"),
  "string.normalize.NFD.preformatted": () => patternForNormalized("NFD"),
  "string.normalize.NFKC": () => normalize("NFKC"),
  "string.normalize.NFKC.preformatted": () => patternForNormalized("NFKC"),
  "string.normalize.NFKD": () => normalize("NFKD"),
  "string.normalize.NFKD.preformatted": () => patternForNormalized("NFKD"),
  "string.numeric": () => pattern(NUMERIC, "a well-formed numeric string"),
  "string.numeric.parse": () => morph(pattern(NUMERIC, "a well-formed numeric string"), (value) => Number.parseFloat(value), { k: "number" }),
  "string.regex": () => ({
    k: "refine",
    base: { k: "string" },
    pred: (value) => {
      try {
        new RegExp(value);
        return true;
      } catch {
        return false;
      }
    },
    expected: "a regex pattern",
    json: { format: "regex" }
  }),
  "string.semver": () => pattern(SEMVER, "a semantic version"),
  "string.trim": () => morph({ k: "string" }, (value) => value.trim()),
  "string.trim.preformatted": () => pattern(/^\S.*\S$|^\S?$/, "trimmed"),
  "string.upper": () => morph({ k: "string" }, (value) => value.toUpperCase()),
  "string.upper.preformatted": () => pattern(/^[A-Z]*$/, "only uppercase letters"),
  "string.url": () => ({ k: "string", url: true }),
  "string.url.parse": () => morph({ k: "string", url: true }, (value) => new URL(value), { k: "instance", ctor: URL, expected: "a URL" }),
  "string.uuid": () => pattern(UUID, "a UUID", "uuid"),
  "string.uuid.v1": () => uuidVersion("1"),
  "string.uuid.v2": () => uuidVersion("2"),
  "string.uuid.v3": () => uuidVersion("3"),
  "string.uuid.v4": () => uuidVersion("4"),
  "string.uuid.v5": () => uuidVersion("5"),
  "string.uuid.v6": () => uuidVersion("6"),
  "string.uuid.v7": () => uuidVersion("7"),
  "string.uuid.v8": () => uuidVersion("8"),
  "parse.number": () => morph(pattern(NUMERIC, "a well-formed numeric string"), (value) => Number.parseFloat(value), { k: "number" }),
  "parse.integer": () => morph(pattern(INTEGER, "a well-formed integer string"), (value) => Number.parseInt(value, 10), {
    k: "number",
    int: true
  }),
  "parse.json": () => keywordFactories["string.json.parse"](),
  "parse.date": () => keywordFactories["string.date.parse"](),
  "parse.url": () => keywordFactories["string.url.parse"](),
  "parse.boolean": () => morph(pattern(/^(?:true|false)$/, "a boolean string"), (value) => value === "true", { k: "boolean" }),
  "parse.bigint": () => morph(pattern(INTEGER, "an integer string"), (value) => BigInt(value), { k: "bigint" })
};
function keywordIR(name) {
  return keywordFactories[name]?.();
}
function patternIR(regex) {
  return pattern(regex, `a string matching ${regex}`);
}
function templateIR(source) {
  let patternSource = "^";
  let index = 0;
  const placeholder = /\$\{(string|number|bigint|boolean)\}/g;
  for (let match = placeholder.exec(source);match; match = placeholder.exec(source)) {
    patternSource += escapeRegex(source.slice(index, match.index));
    switch (match[1]) {
      case "number":
        patternSource += "[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)";
        break;
      case "bigint":
        patternSource += "[+-]?\\d+";
        break;
      case "boolean":
        patternSource += "(?:true|false)";
        break;
      default:
        patternSource += ".*";
    }
    index = match.index + match[0].length;
  }
  patternSource += `${escapeRegex(source.slice(index))}$`;
  return pattern(new RegExp(patternSource), `a string matching \`${source}\``);
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// node_modules/@oh-my-pi/omptype/src/ir.ts
var IR_BRAND = Symbol("omptype.schema");
var kMorph = Symbol("omptype.hasMorph");
var kMorphOwner = Symbol("omptype.hasMorphOwner");
var kAlias = Symbol("omptype.hasAlias");
var kAliasOwner = Symbol("omptype.hasAliasOwner");
var kSimple = Symbol("omptype.simple");
var kSimpleOwner = Symbol("omptype.simpleOwner");
var SIMPLE_OPS = "|&()[]=?%,#";
function tokenize2(src) {
  const toks = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\t" || c === `
` || c === "\r") {
      i++;
      continue;
    }
    if (c === "d" && (src[i + 1] === "'" || src[i + 1] === '"')) {
      const quote = src[i + 1];
      const end = src.indexOf(quote, i + 2);
      if (end < 0)
        throw new OmpTypeError(`unterminated date literal in "${src}"`);
      const source = src.slice(i + 2, end).trim();
      const value = /^\d+$/.test(source) ? new Date(Number(source)) : new Date(source);
      if (Number.isNaN(value.valueOf()))
        throw new OmpTypeError(`invalid date literal in "${src}"`);
      toks.push({ t: "date", v: value });
      i = end + 1;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      let value = "";
      for (;j < n && src[j] !== c; j++) {
        if (src[j] === "\\") {
          j++;
          if (j >= n)
            break;
        }
        value += src[j];
      }
      if (j >= n)
        throw new OmpTypeError(`unterminated string literal in "${src}"`);
      toks.push({ t: "str", v: value });
      i = j + 1;
      continue;
    }
    if (c === "/") {
      let j = i + 1;
      for (;j < n; j++) {
        if (src[j] === "\\")
          j++;
        else if (src[j] === "/")
          break;
      }
      if (j >= n)
        throw new OmpTypeError(`unterminated regular expression in "${src}"`);
      let end = j + 1;
      while (end < n && /[dgimsuvy]/.test(src[end]))
        end++;
      const source = src.slice(i + 1, j);
      const flags = src.slice(j + 1, end);
      try {
        toks.push({ t: "regex", v: new RegExp(source, flags) });
      } catch {
        throw new OmpTypeError(`invalid regular expression "${src.slice(i, end)}"`);
      }
      i = end;
      continue;
    }
    if (c >= "0" && c <= "9" || c === "-" && i + 1 < n && src[i + 1] >= "0" && src[i + 1] <= "9") {
      let j = i + 1;
      while (j < n && /[\w.+-]/.test(src[j]))
        j++;
      const raw = src.slice(i, j);
      if (/^-?(?:0|[1-9]\d*)n$/.test(raw) && raw !== "-0n") {
        toks.push({ t: "bigint", v: BigInt(raw.slice(0, -1)) });
      } else {
        const valid = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(raw) && !Object.is(Number(raw), -0) && String(Number(raw)) === raw;
        if (!valid)
          throw new OmpTypeError(`Malformed number literal '${raw}'`);
        toks.push({ t: "num", v: Number(raw) });
      }
      i = j;
      continue;
    }
    if (/[a-zA-Z_$]/.test(c)) {
      let j = i + 1;
      while (j < n && /[\w.$]/.test(src[j]))
        j++;
      toks.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (c === "<" || c === ">") {
      if (src[i + 1] === "=") {
        toks.push({ t: "op", v: `${c}=` });
        i += 2;
      } else {
        toks.push({ t: "op", v: c });
        i++;
      }
      continue;
    }
    if (c === "=" && src[i + 1] === "=") {
      toks.push({ t: "op", v: "==" });
      i += 2;
      continue;
    }
    if (SIMPLE_OPS.includes(c)) {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new OmpTypeError(`unexpected character '${c}' in "${src}"`);
  }
  return toks;
}
var CMP = { "<": true, "<=": true, ">": true, ">=": true };
var KEYWORDS = {
  number: () => ({ k: "number" }),
  "number.integer": () => ({ k: "number", int: true }),
  boolean: () => ({ k: "boolean" }),
  bigint: () => ({ k: "bigint" }),
  symbol: () => ({ k: "symbol" }),
  never: () => ({ k: "never" }),
  null: () => ({ k: "null" }),
  undefined: () => ({ k: "undefined" }),
  unknown: () => ({ k: "unknown" }),
  any: () => ({ k: "unknown" }),
  object: () => ({ k: "anyobject" }),
  Date: () => ({ k: "instance", ctor: Date, expected: "a Date" }),
  true: () => ({ k: "lit", v: true }),
  false: () => ({ k: "lit", v: false })
};
var THIS_ONLY_RESOLVERS = new WeakSet;
function markThisOnlyResolver(resolve) {
  THIS_ONLY_RESOLVERS.add(resolve);
}

class StrParser {
  #toks;
  #pos = 0;
  #src;
  #resolve;
  constructor(src, resolve) {
    this.#src = src;
    this.#resolve = resolve;
    this.#toks = tokenize2(src);
  }
  #peek(offset = 0) {
    return this.#toks[this.#pos + offset];
  }
  #next() {
    const t = this.#toks[this.#pos++];
    if (!t)
      throw new OmpTypeError(`unexpected end of definition "${this.#src}"`);
    return t;
  }
  #eatOp(v) {
    const t = this.#peek();
    if (t?.t === "op" && t.v === v) {
      this.#pos++;
      return true;
    }
    return false;
  }
  parseTop() {
    const ir = this.parseUnion();
    let def;
    let hasDefault = false;
    if (this.#eatOp("=")) {
      const t = this.#next();
      if (t.t === "num" || t.t === "bigint" || t.t === "date" || t.t === "str")
        def = t.v;
      else if (t.t === "id" && (t.v === "true" || t.v === "false"))
        def = t.v === "true";
      else if (t.t === "id" && t.v === "null")
        def = null;
      else if (t.t === "id" && t.v === "undefined")
        def = undefined;
      else
        throw new OmpTypeError(`unsupported default literal in "${this.#src}"`);
      hasDefault = true;
    }
    const optional = this.#eatOp("?");
    this.#expectEnd();
    return { ir, def, hasDefault, optional };
  }
  #expectEnd() {
    if (this.#pos < this.#toks.length) {
      throw new OmpTypeError(`trailing tokens in definition "${this.#src}"`);
    }
  }
  parseUnion() {
    const first = this.parseIntersection();
    if (!this.#eatOp("|"))
      return first;
    const members = [first, this.parseIntersection()];
    while (this.#eatOp("|"))
      members.push(this.parseIntersection());
    return { k: "union", members };
  }
  parseIntersection() {
    const first = this.parseBounded();
    if (!this.#eatOp("&"))
      return first;
    const members = [first, this.parseBounded()];
    while (this.#eatOp("&"))
      members.push(this.parseBounded());
    const literal = members.find((member) => member.k === "lit");
    if (literal && typeof literal.v === "number") {
      for (const member of members) {
        if (member.k === "number" && (member.int && !Number.isInteger(literal.v) || member.divisor !== undefined && literal.v % member.divisor !== 0 || member.min !== undefined && (member.xmin ? literal.v <= member.min : literal.v < member.min) || member.max !== undefined && (member.xmax ? literal.v >= member.max : literal.v > member.max))) {
          throw new OmpTypeError("literal is excluded by intersection");
        }
      }
      return literal;
    }
    return { k: "intersection", members };
  }
  parseBounded() {
    const t = this.#peek();
    const t1 = this.#peek(1);
    if ((t?.t === "num" || t?.t === "date") && t1?.t === "op" && (t1.v === "<" || t1.v === "<=")) {
      const lo = t.v;
      this.#pos += 2;
      let node = this.#eatDivisor(this.parsePostfix());
      node = applyBound(node, flip(t1.v), lo, this.#src);
      const t2 = this.#peek();
      if (!(t2?.t === "op" && CMP[t2.v])) {
        throw new OmpTypeError(`left bound requires a corresponding right bound in "${this.#src}"`);
      }
      if (t2.v === ">" || t2.v === ">=") {
        throw new OmpTypeError(`right bound must use < or <= in "${this.#src}"`);
      }
      this.#pos++;
      const hi = this.#next();
      if (hi.t !== "num" && hi.t !== "date") {
        throw new OmpTypeError(`expected bound after comparator in "${this.#src}"`);
      }
      node = applyBound(node, t2.v, hi.v, this.#src);
      return this.#eatArraySuffixes(node);
    }
    let node = this.#eatDivisor(this.parsePostfix());
    const t2 = this.#peek();
    if (t2?.t === "op" && t2.v === "==") {
      this.#pos++;
      const limit = this.#next();
      if (limit.t !== "num" && limit.t !== "bigint" && limit.t !== "date") {
        throw new OmpTypeError(`expected literal after == in "${this.#src}"`);
      }
      node = applyEquality(node, limit.v, this.#src);
    } else if (t2?.t === "op" && CMP[t2.v] && (this.#peek(1)?.t === "num" || this.#peek(1)?.t === "date")) {
      this.#pos++;
      const limit = this.#next();
      node = applyBound(node, t2.v, limit.v, this.#src);
      node = this.#eatArraySuffixes(node);
    }
    return node;
  }
  #eatDivisor(node) {
    if (!this.#eatOp("%"))
      return node;
    const divisor = this.#next();
    if (divisor.t !== "num")
      throw new OmpTypeError(`expected number after % in "${this.#src}"`);
    if (node.k !== "number")
      throw new OmpTypeError(`% requires number in "${this.#src}"`);
    if (!Number.isFinite(divisor.v) || !Number.isInteger(divisor.v) || divisor.v === 0)
      throw new OmpTypeError(`divisor must be a non-zero integer in "${this.#src}"`);
    return { ...node, divisor: Math.abs(divisor.v) };
  }
  #eatArraySuffixes(node) {
    for (;; ) {
      const t = this.#peek();
      if (!(t?.t === "op" && t.v === "["))
        return node;
      this.#pos++;
      if (!this.#eatOp("]"))
        throw new OmpTypeError(`expected ']' in "${this.#src}"`);
      node = { k: "array", el: node };
    }
  }
  parsePostfix() {
    let node = this.parsePrimary();
    for (;; ) {
      const t = this.#peek();
      if (t?.t === "op" && t.v === "[") {
        this.#pos++;
        if (!this.#eatOp("]"))
          throw new OmpTypeError(`expected ']' in "${this.#src}"`);
        node = { k: "array", el: node };
        continue;
      }
      if (t?.t === "op" && t.v === "#") {
        this.#pos++;
        const name = this.#next();
        if (name.t !== "id")
          throw new OmpTypeError(`expected brand name after # in "${this.#src}"`);
        continue;
      }
      break;
    }
    return node;
  }
  #parseGenericArguments() {
    this.#eatOp("<");
    const arguments_ = [];
    if (this.#eatOp(">"))
      return arguments_;
    for (;; ) {
      arguments_.push(this.parseUnion());
      if (this.#eatOp(">"))
        return arguments_;
      if (!this.#eatOp(","))
        throw new OmpTypeError(`expected ',' or '>' in "${this.#src}"`);
      const next = this.#peek();
      if (next?.t === "op" && (next.v === "," || next.v === ">")) {
        throw new OmpTypeError(`generic arguments cannot be empty in "${this.#src}"`);
      }
    }
  }
  parsePrimary() {
    const t = this.#next();
    if (t.t === "op" && t.v === "(") {
      const inner = this.parseUnion();
      if (!this.#eatOp(")"))
        throw new OmpTypeError(`expected ')' in "${this.#src}"`);
      return inner;
    }
    if (t.t === "str" || t.t === "num" || t.t === "bigint" || t.t === "date")
      return { k: "lit", v: t.v };
    if (t.t === "regex")
      return patternIR(t.v);
    if (t.t === "id") {
      if (t.v === "keyof") {
        try {
          return keyOf(this.parsePostfix());
        } catch (error) {
          if (error instanceof OmpTypeError)
            throw new OmpTypeError("keyof operand must be an object");
          throw error;
        }
      }
      if (t.v === "Array.liftFrom" && this.#peek()?.t === "op" && this.#peek()?.v === "<") {
        this.#pos++;
        const element = this.parsePrimary();
        if (!this.#eatOp(">"))
          throw new OmpTypeError(`expected '>' in "${this.#src}"`);
        const array = { k: "array", el: element, desc: "an object" };
        return {
          k: "morph",
          input: { k: "union", members: [element, array] },
          fn: (value) => Array.isArray(value) ? value : [value],
          out: array
        };
      }
      if (t.v === "Record" && this.#peek()?.t === "op" && this.#peek()?.v === "<") {
        const arguments_ = this.#parseGenericArguments();
        if (arguments_.length !== 2)
          throw new OmpTypeError("Record requires two arguments");
        return { k: "object", props: [], index: arguments_[1], extras: "keep" };
      }
      if (this.#peek()?.t === "op" && this.#peek()?.v === "<" && this.#resolve?.hasGeneric?.(t.v)) {
        const arguments_ = this.#parseGenericArguments();
        const instantiated = this.#resolve.generic?.(t.v, arguments_);
        if (!instantiated)
          throw new OmpTypeError(`unknown generic "${t.v}" in "${this.#src}"`);
        return instantiated;
      }
      const scoped = this.#resolve?.(t.v);
      const make = KEYWORDS[t.v];
      const keyword = scoped ?? make?.() ?? keywordIR(t.v);
      if (!keyword)
        throw new OmpTypeError(`unknown keyword "${t.v}" in "${this.#src}"`);
      return keyword;
    }
    throw new OmpTypeError(`unexpected token in "${this.#src}"`);
  }
}
var STRING_DEF_CACHE_MAX = 1024;
var stringDefCache = new Map;
function isWhitespaceAt(src, index) {
  const code = src.charCodeAt(index);
  return code === 32 || code >= 9 && code <= 13 || code > 127 && /\s/.test(src[index]);
}
function parseLiteralUnion(src) {
  const members = [];
  let index = 0;
  while (index < src.length && isWhitespaceAt(src, index))
    index++;
  for (;; ) {
    const quote = src[index];
    if (quote !== "'" && quote !== '"')
      return;
    const end = src.indexOf(quote, index + 1);
    if (end < 0)
      return;
    members.push({ k: "lit", v: src.slice(index + 1, end) });
    index = end + 1;
    while (index < src.length && isWhitespaceAt(src, index))
      index++;
    if (index === src.length) {
      const ir = members.length === 1 ? members[0] : { k: "union", members };
      let simple = true;
      for (let member = 1;simple && member < members.length; member++) {
        for (let previous = 0;previous < member; previous++) {
          if (members[previous].k === "lit" && members[previous].v === members[member].v) {
            simple = false;
            break;
          }
        }
      }
      ir[kSimple] = simple;
      ir[kSimpleOwner] = ir;
      return ir;
    }
    if (src[index] !== "|")
      return;
    index++;
    while (index < src.length && isWhitespaceAt(src, index))
      index++;
  }
}
function genericArguments(src) {
  const open = src.indexOf("<");
  if (open < 1 || !src.endsWith(">"))
    return;
  const name = src.slice(0, open).trim();
  const body = src.slice(open + 1, -1);
  const args = [];
  let depth = 0;
  let quote = "";
  let start = 0;
  for (let index = 0;index < body.length; index++) {
    const char = body[index];
    if (quote !== "") {
      if (char === quote && body[index - 1] !== "\\")
        quote = "";
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
    } else if (char === "<" || char === "(" || char === "[") {
      depth++;
    } else if (char === ">" || char === ")" || char === "]") {
      depth--;
    } else if (char === "," && depth === 0) {
      args.push(body.slice(start, index).trim());
      start = index + 1;
    }
  }
  args.push(body.slice(start).trim());
  return { name, args };
}
function genericKeys(ir) {
  const keys = new Set;
  const visit = (node) => {
    if (node.k === "lit" && typeof node.v === "string")
      keys.add(node.v);
    else if (node.k === "union")
      for (const member of node.members)
        visit(member);
  };
  visit(ir);
  return keys;
}
function resolveStructuralIR(ir) {
  const seen = new Set;
  while (ir.k === "alias") {
    if (seen.has(ir))
      throw new OmpTypeError(`cannot structurally transform recursive alias "${ir.name}"`);
    seen.add(ir);
    ir = ir.resolve();
  }
  return ir;
}
function mergeObjectIR(left, right) {
  left = resolveStructuralIR(left);
  right = resolveStructuralIR(right);
  if (left.k !== "object" || right.k !== "object") {
    throw new OmpTypeError("Merge requires object arguments");
  }
  const props = [...left.props];
  for (const prop of right.props) {
    const index = props.findIndex((candidate) => candidate.key === prop.key);
    if (index < 0)
      props.push(prop);
    else
      props[index] = prop;
  }
  return {
    k: "object",
    props,
    index: right.index ?? left.index,
    symbolIndex: right.symbolIndex ?? left.symbolIndex,
    patternIndexes: left.patternIndexes === undefined && right.patternIndexes === undefined ? undefined : [...left.patternIndexes ?? [], ...right.patternIndexes ?? []],
    extras: right.extras === "keep" ? left.extras : right.extras
  };
}
function parseGeneric(src, resolve) {
  const generic = genericArguments(src);
  if (generic === undefined)
    return;
  if (generic.name === "Array.liftFrom" && generic.args.length === 1) {
    const element = parseDef(generic.args[0], resolve);
    const array = { k: "array", el: element, desc: "an object" };
    return {
      k: "morph",
      input: { k: "union", members: [element, array] },
      fn: (value) => Array.isArray(value) ? value : [value],
      out: array
    };
  }
  if (generic.name === "Record" && generic.args.length === 2) {
    return { k: "object", props: [], index: parseDef(generic.args[1], resolve), extras: "keep" };
  }
  if ((generic.name === "Extract" || generic.name === "Exclude") && generic.args.length === 2) {
    return distributeFilter(parseDef(generic.args[0], resolve), parseDef(generic.args[1], resolve), generic.name === "Extract");
  }
  if ((generic.name === "Partial" || generic.name === "Required") && generic.args.length === 1) {
    const object = resolveStructuralIR(parseDef(generic.args[0], resolve));
    if (object.k !== "object")
      throw new OmpTypeError(`${generic.name} requires an object`);
    const optional = generic.name === "Partial";
    return { ...object, props: object.props.map((prop) => ({ ...prop, opt: optional })) };
  }
  if ((generic.name === "Pick" || generic.name === "Omit") && generic.args.length === 2) {
    const object = resolveStructuralIR(parseDef(generic.args[0], resolve));
    if (object.k !== "object")
      throw new OmpTypeError(`${generic.name} requires an object`);
    const keys = genericKeys(parseDef(generic.args[1], resolve));
    const pick = generic.name === "Pick";
    return { ...object, props: object.props.filter((prop) => keys.has(prop.key) === pick) };
  }
  if (generic.name === "Merge" && generic.args.length === 2) {
    return mergeObjectIR(parseDef(generic.args[0], resolve), parseDef(generic.args[1], resolve));
  }
  return;
}
var isAssignable = () => false;
function useAssignability(compare) {
  isAssignable = compare;
}
function distributeFilter(base, target, keepAssignable) {
  const resolved = base.k === "alias" ? base.resolve() : base;
  const members = resolved.k === "union" ? resolved.members : [resolved];
  const retained = members.filter((member) => isAssignable(member, target) === keepAssignable);
  if (retained.length === 0)
    return { k: "never" };
  return retained.length === 1 ? retained[0] : { k: "union", members: retained };
}
function parseRegexExec(src) {
  if (!src.startsWith("x/"))
    return;
  const end = src.lastIndexOf("/");
  if (end < 2)
    throw new OmpTypeError(`unterminated regular expression in "${src}"`);
  let regex;
  try {
    regex = new RegExp(src.slice(2, end), src.slice(end + 1));
  } catch {
    throw new OmpTypeError(`invalid regular expression "${src.slice(1)}"`);
  }
  return {
    k: "morph",
    input: patternIR(regex),
    fn: (value, context) => {
      regex.lastIndex = 0;
      return regex.exec(value) ?? context.error(`a string matching ${regex}`);
    }
  };
}
function parseStringDef(src, resolve) {
  const cacheable = resolve === undefined || !src.includes("this") && THIS_ONLY_RESOLVERS.has(resolve);
  if (cacheable) {
    const cached = stringDefCache.get(src);
    if (cached)
      return cached;
  }
  const pipeIndex = src.indexOf("|>");
  if (pipeIndex >= 0) {
    const input = src.slice(0, pipeIndex).trim();
    const output = src.slice(pipeIndex + 2).trim();
    if (input.length === 0 || output.length === 0) {
      throw new OmpTypeError(`pipe expression requires operands in "${src}"`);
    }
    const parsedInput = parseStringDef(input, resolve);
    if (parsedInput.hasDefault) {
      throw new OmpTypeError(`unexpected pipe expression after default in "${src}"`);
    }
    const parsed = {
      ir: {
        k: "morph",
        input: parsedInput.ir,
        fn: (value) => value,
        out: parseStringDef(output, resolve).ir
      },
      hasDefault: false,
      optional: false
    };
    if (cacheable && stringDefCache.size < STRING_DEF_CACHE_MAX)
      stringDefCache.set(src, parsed);
    return parsed;
  }
  let ir = parseLiteralUnion(src) ?? parseRegexExec(src) ?? parseGeneric(src, resolve);
  if (ir === undefined && src.startsWith("`") && src.endsWith("`")) {
    ir = templateIR(src.slice(1, -1));
  }
  const parsed = ir === undefined ? new StrParser(src, resolve).parseTop() : { ir, hasDefault: false, optional: false };
  if (cacheable && stringDefCache.size < STRING_DEF_CACHE_MAX)
    stringDefCache.set(src, parsed);
  return parsed;
}
function flip(op) {
  switch (op) {
    case "<":
      return ">";
    case "<=":
      return ">=";
    case ">":
      return "<";
    default:
      return "<=";
  }
}
function applyEquality(node, value, src) {
  if (node.k === "union") {
    return { k: "union", members: node.members.map((member) => applyEquality(member, value, src)) };
  }
  if (value instanceof Date) {
    if (!acceptsDate(node))
      throw new OmpTypeError(`Date equality requires Date in "${src}"`);
    return { k: "lit", v: value };
  }
  if (node.k === "number" && typeof value === "number")
    return { k: "lit", v: value };
  if (node.k === "bigint" && typeof value === "bigint")
    return { k: "lit", v: value };
  if ((node.k === "string" || node.k === "array") && typeof value === "number") {
    if (!Number.isInteger(value) || value < 0) {
      throw new OmpTypeError(`exact length must be a non-negative integer in "${src}"`);
    }
    return { ...node, min: value, max: value };
  }
  throw new OmpTypeError(`equality literal is incompatible with ${node.k} in "${src}"`);
}
function applyBound(node, op, value, src) {
  if (node.k === "alias")
    return applyBound(node.resolve(), op, value, src);
  if (node.k === "refine" && !(value instanceof Date)) {
    return { ...node, base: applyBound(node.base, op, value, src) };
  }
  if (node.k === "union") {
    const kinds = new Set(node.members.map(boundKind));
    if (kinds.size !== 1)
      throw new OmpTypeError(`cannot apply one bound to multiple bound kinds in "${src}"`);
    return { k: "union", members: node.members.map((member) => applyBound(member, op, value, src)) };
  }
  if (!(value instanceof Date) && acceptsDate(node)) {
    return applyBound(node, op, new Date(value), src);
  }
  if (value instanceof Date) {
    if (!acceptsDate(node))
      throw new OmpTypeError(`date bound requires Date in "${src}"`);
    const limit = value.valueOf();
    const relation = op === ">=" ? "on or after" : op === ">" ? "later than" : op === "<=" ? "on or before" : "earlier than";
    return {
      k: "refine",
      base: node,
      pred: (input) => {
        if (!(input instanceof Date))
          return false;
        const time = input.valueOf();
        return op === ">=" ? time >= limit : op === ">" ? time > limit : op === "<=" ? time <= limit : time < limit;
      },
      expected: `a Date ${relation} ${value.toISOString()}`
    };
  }
  if (node.k === "number") {
    const bounded = { ...node };
    switch (op) {
      case ">=":
        bounded.min = value;
        bounded.xmin = false;
        break;
      case ">":
        bounded.min = value;
        bounded.xmin = true;
        break;
      case "<=":
        bounded.max = value;
        bounded.xmax = false;
        break;
      case "<":
        bounded.max = value;
        bounded.xmax = true;
        break;
    }
    if (bounded.min !== undefined && bounded.max !== undefined && (bounded.min > bounded.max || bounded.min === bounded.max && (bounded.xmin || bounded.xmax))) {
      throw new OmpTypeError(`numeric range is unsatisfiable in "${src}"`);
    }
    return bounded;
  }
  if (node.k === "string" || node.k === "array") {
    if (!Number.isInteger(value) || value < 0) {
      throw new OmpTypeError(`length bound must be a non-negative integer in "${src}"`);
    }
    const bounded = { ...node };
    switch (op) {
      case ">=":
        bounded.min = value;
        break;
      case ">":
        bounded.min = value + 1;
        break;
      case "<=":
        bounded.max = value;
        break;
      case "<":
        bounded.max = value - 1;
        break;
    }
    if (bounded.min !== undefined && bounded.max !== undefined && bounded.min > bounded.max || (bounded.max ?? 0) < 0) {
      throw new OmpTypeError(`length range is unsatisfiable in "${src}"`);
    }
    return bounded;
  }
  throw new OmpTypeError(`cannot bound ${node.k} in "${src}"`);
}
function acceptsDate(node) {
  return node.k === "instance" && node.ctor === Date || node.k === "refine" && acceptsDate(node.base);
}
function isEmbedded(def) {
  return (typeof def === "function" || typeof def === "object" && def !== null) && IR_BRAND in def;
}
function embed(schema) {
  if (schema.hasSteps)
    return { k: "sub", schema, desc: schema.description, descAuto: schema.ir.desc === undefined };
  if (schema.description !== undefined && schema.ir.desc === undefined) {
    return { ...schema.ir, desc: schema.description, descAuto: true };
  }
  return schema.ir;
}
function boundKind(node) {
  if (node.k === "number")
    return "number";
  if (node.k === "string" || node.k === "array")
    return "length";
  if (acceptsDate(node))
    return "date";
  return;
}
function isCallback(value) {
  return typeof value === "function";
}
function isConstructor(value) {
  return typeof value === "function" && value.prototype !== undefined;
}
function parseTupleItem(def, resolve) {
  if (Array.isArray(def) && def.length === 2 && def[1] === "?") {
    return { val: parseDef(def[0], resolve), opt: true };
  }
  if (Array.isArray(def) && def.length === 3 && def[1] === "=") {
    return {
      val: parseDef(def[0], resolve),
      opt: true,
      def: def[2],
      defFactory: typeof def[2] === "function",
      hasDefault: true
    };
  }
  if (typeof def === "string") {
    const parsed = parseStringDef(def, resolve);
    return {
      val: parsed.ir,
      opt: parsed.optional || parsed.hasDefault,
      def: parsed.def,
      hasDefault: parsed.hasDefault
    };
  }
  return { val: parseDef(def, resolve), opt: false };
}
function cloneTuple(tuple) {
  return {
    ...tuple,
    prefix: tuple.prefix.map((item) => ({ ...item })),
    postfix: [...tuple.postfix]
  };
}
function hasOptionalPrefix(tuple) {
  return tuple.prefix.some((item) => item.opt || item.hasDefault === true);
}
function appendTupleItem(tuple, item) {
  if (tuple.variadic !== undefined) {
    if (item.opt || item.hasDefault) {
      throw new OmpTypeError("An optional element may not follow a variadic element");
    }
    if (hasOptionalPrefix(tuple)) {
      throw new OmpTypeError("A postfix required element cannot follow an optional or defaultable element");
    }
    tuple.postfix.push(item.val);
    return;
  }
  if (item.hasDefault && tuple.prefix.some((prefixItem) => prefixItem.opt && !prefixItem.hasDefault)) {
    throw new OmpTypeError("A defaultable element may not follow an optional element without a default");
  }
  if (hasOptionalPrefix(tuple) && !item.opt) {
    throw new OmpTypeError("required tuple elements cannot follow optional elements");
  }
  tuple.prefix.push(item);
}
function appendTuple(target, spread) {
  if (target.variadic !== undefined && spread.variadic !== undefined) {
    throw new OmpTypeError("a tuple may have one spread followed by an array definition");
  }
  for (const item of spread.prefix)
    appendTupleItem(target, { ...item });
  if (spread.variadic !== undefined) {
    target.variadic = spread.variadic;
  }
  for (const item of spread.postfix)
    appendTupleItem(target, { val: item, opt: false });
}
function spreadAlternatives(spread) {
  if (spread.k === "alias")
    return spreadAlternatives(spread.resolve());
  if (spread.k === "sub")
    return spreadAlternatives(spread.schema.ir);
  if (spread.k === "union")
    return spread.members.flatMap(spreadAlternatives);
  if (spread.k === "array")
    return [{ k: "tuple", prefix: [], variadic: spread.el, postfix: [] }];
  if (spread.k === "tuple")
    return [spread];
  throw new OmpTypeError("tuple spread element must be an array");
}
function parseTuple(def, resolve) {
  let branches = [{ k: "tuple", prefix: [], postfix: [] }];
  for (let index = 0;index < def.length; index++) {
    if (def[index] === "...") {
      if (index + 1 >= def.length) {
        throw new OmpTypeError("a tuple may have one spread followed by an array definition");
      }
      const alternatives = spreadAlternatives(parseDef(def[++index], resolve));
      const distributed = [];
      for (const branch of branches) {
        for (const alternative of alternatives) {
          const next = cloneTuple(branch);
          appendTuple(next, alternative);
          distributed.push(next);
        }
      }
      branches = distributed;
      continue;
    }
    const item = parseTupleItem(def[index], resolve);
    for (const branch of branches)
      appendTupleItem(branch, { ...item });
  }
  return branches.length === 1 ? branches[0] : { k: "union", members: branches };
}
function keyOf(node) {
  if (node.k === "alias")
    return keyOf(node.resolve());
  if (node.k === "sub")
    return keyOf(node.schema.ir);
  if (node.k === "refine")
    return keyOf(node.base);
  if (node.k === "intersection") {
    const members = node.members.flatMap((member) => {
      const keys = keyOf(member);
      return keys.k === "union" ? keys.members : [keys];
    });
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  if (node.k === "object") {
    const members = node.props.map((prop) => ({ k: "lit", v: prop.key }));
    if (node.index !== undefined || (node.patternIndexes?.length ?? 0) > 0)
      members.push({ k: "string" });
    if (node.symbolIndex !== undefined)
      members.push({ k: "symbol" });
    if (members.length === 0)
      return { k: "never" };
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  if (node.k === "tuple")
    return { k: "number", int: true, min: 0 };
  if (node.k === "union") {
    if (node.members.length === 0)
      return { k: "never" };
    const literalSets = node.members.map((member) => {
      const keyed = keyOf(member);
      const literals = keyed.k === "union" ? keyed.members : [keyed];
      const keys = new Set;
      for (const literal of literals) {
        if (literal.k === "lit" && (typeof literal.v === "string" || typeof literal.v === "number" || typeof literal.v === "symbol")) {
          keys.add(literal.v);
        }
      }
      return keys;
    });
    const common = [...literalSets[0]].filter((key) => literalSets.slice(1).every((keys) => keys.has(key)));
    if (common.length === 0)
      throw new OmpTypeError("keyof operand must be an object");
    const members = common.map((value) => ({ k: "lit", v: value }));
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  throw new OmpTypeError("keyof operand must be an object");
}
function parseArrayExpression(def, resolve) {
  if (def.length === 2 && def[1] === "[]")
    return { k: "array", el: parseDef(def[0], resolve) };
  if (def.length === 2 && def[0] === "keyof")
    return keyOf(parseDef(def[1], resolve));
  if (def[0] === "instanceof") {
    const members = [];
    for (let index = 1;index < def.length; index++) {
      const ctor = def[index];
      if (!isConstructor(ctor))
        throw new OmpTypeError("instanceof operands must be constructors");
      members.push({
        k: "instance",
        ctor,
        expected: ctor === Error ? "an Error" : `an instance of ${ctor.name || "the constructor"}`
      });
    }
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  if (def[0] === "===") {
    const members = def.slice(1).map((value) => ({ k: "lit", v: value }));
    if (members.length === 0)
      return { k: "never" };
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  if (def.length >= 3 && def[1] === "|") {
    return { k: "union", members: [parseDef(def[0], resolve), parseDef(def[2], resolve)] };
  }
  if (def.length >= 3 && def[1] === "&") {
    return { k: "intersection", members: [parseDef(def[0], resolve), parseDef(def[2], resolve)] };
  }
  if (def.length === 3 && def[1] === "=>") {
    if (!isCallback(def[2]))
      throw new OmpTypeError("morph operator requires a function");
    return { k: "morph", input: parseDef(def[0], resolve), fn: def[2] };
  }
  if (def.length === 3 && def[1] === "|>") {
    return { k: "morph", input: parseDef(def[0], resolve), fn: (value) => value, out: parseDef(def[2], resolve) };
  }
  if (def.length === 3 && def[1] === ":") {
    if (!isCallback(def[2]))
      throw new OmpTypeError("narrow operator requires a predicate");
    const predicate = def[2];
    const name = predicate.name;
    const expected = name.length === 0 ? "valid according to an anonymous predicate" : `valid according to ${name}`;
    return {
      k: "refine",
      base: parseDef(def[0], resolve),
      pred: (value) => {
        let errors;
        const error = (input) => {
          const detail = typeof input === "string" ? { expected: input } : input;
          const next = OmpErrors.single([...detail.path ?? detail.relativePath ?? []], detail.expected, value, {
            preserveActual: true,
            ...Object.hasOwn(detail, "actual") ? { actual: String(detail.actual) } : {}
          });
          if (errors)
            errors.append(next);
          else
            errors = next;
          return next;
        };
        const result = predicate(value, { error, reject: error });
        return errors ?? (result instanceof OmpErrors ? result : result === true);
      },
      expected
    };
  }
  if (def.length >= 3 && def[1] === "@") {
    const base = parseDef(def[0], resolve);
    const meta = def[2];
    if (typeof meta === "string")
      return { ...base, desc: meta, cfg: { ...base.cfg, expected: meta } };
    if (typeof meta === "object" && meta !== null) {
      const config = meta;
      return {
        ...base,
        cfg: {
          ...typeof config.description === "string" ? { expected: config.description } : {},
          ...config
        },
        ...typeof config.description === "string" ? { desc: config.description } : {}
      };
    }
    return base;
  }
  return parseTuple(def, resolve);
}
function isObjectDefinition(def) {
  return typeof def === "object" && def !== null && !Array.isArray(def) && !(def instanceof RegExp) && !(def instanceof Date);
}
function spreadObjectOf(ir) {
  if (ir.k === "alias")
    return spreadObjectOf(ir.resolve());
  if (ir.k === "sub")
    return spreadObjectOf(ir.schema.ir);
  if (ir.k === "refine")
    return spreadObjectOf(ir.base);
  if (ir.k === "anyobject")
    return { k: "object", props: [], extras: "keep" };
  if (ir.k === "object")
    return ir;
  if (ir.k !== "intersection")
    return;
  let result = { k: "object", props: [], extras: "keep" };
  for (const member of ir.members) {
    const object = spreadObjectOf(member);
    if (object === undefined)
      return;
    result = mergeObjectIR(result, object);
  }
  return result;
}
function indexKeyKind(key, value, props, indexes) {
  if (key.k === "alias")
    return indexKeyKind(key.resolve(), value, props, indexes);
  if (key.k === "union") {
    for (const member of key.members)
      indexKeyKind(member, value, props, indexes);
    return;
  }
  if (key.k === "lit" && (typeof key.v === "string" || typeof key.v === "symbol")) {
    props.push({ key: key.v, opt: false, val: value });
    return;
  }
  if (key.k === "string") {
    indexes.string = value;
    return;
  }
  if (key.k === "symbol") {
    indexes.symbol = value;
    return;
  }
  if (key.k === "refine" && key.base.k === "string") {
    indexes.patterns.push({ key, val: value });
    return;
  }
  throw new OmpTypeError(`indexed key definition must resolve to a string or symbol (was ${expectedOf(key)})`);
}
function addObjectProp(props, spreadKeys, prop) {
  if (spreadKeys === undefined) {
    props.push(prop);
    return;
  }
  const previous = props.findIndex((candidate) => candidate.key === prop.key);
  if (previous < 0) {
    props.push(prop);
    return;
  }
  if (!spreadKeys.delete(prop.key))
    throw new OmpTypeError(`duplicate object key ${String(prop.key)}`);
  props[previous] = prop;
}
function parseObjectDefinition(def, resolve) {
  const props = [];
  let spreadKeys;
  let normalizedKey;
  let normalizedKeys;
  let indexes;
  let extras = "keep";
  let simple = true;
  for (const originalKey in def) {
    if (!Object.hasOwn(def, originalKey))
      continue;
    const val = def[originalKey];
    if (originalKey === "+") {
      if (val === "reject" || val === "delete") {
        extras = val;
        if (val === "delete")
          simple = false;
      } else if (val === "ignore")
        extras = "keep";
      else
        throw new OmpTypeError(`bad "+" value ${String(val)}`);
      continue;
    }
    if (originalKey === "...") {
      const parsed = parseDef(val, resolve);
      const spread = spreadObjectOf(parsed);
      if (spread === undefined) {
        throw new OmpTypeError(`object spread must resolve to an object literal (was ${expectedOf(parsed)})`);
      }
      if (simple && !isSimpleIR(spread))
        simple = false;
      spreadKeys ??= new Set;
      for (const prop of spread.props) {
        const previous = props.findIndex((candidate) => candidate.key === prop.key);
        if (previous < 0)
          props.push(prop);
        else
          props[previous] = prop;
        spreadKeys.add(prop.key);
      }
      if (spread.index !== undefined || spread.symbolIndex !== undefined || spread.patternIndexes !== undefined) {
        const objectIndexes = indexes ?? { patterns: [] };
        indexes = objectIndexes;
        objectIndexes.string ??= spread.index;
        objectIndexes.symbol ??= spread.symbolIndex;
        if (spread.patternIndexes !== undefined)
          objectIndexes.patterns.push(...spread.patternIndexes);
      }
      if (spread.extras !== "keep")
        extras = spread.extras;
      continue;
    }
    if (typeof originalKey === "string" && originalKey.startsWith("[") && originalKey.endsWith("]")) {
      let value;
      if (typeof val === "string") {
        const parsed = parseStringDef(val, resolve);
        if (parsed.hasDefault)
          throw new OmpTypeError("index signatures cannot specify a default");
        value = parsed.ir;
      } else {
        if (Array.isArray(val) && val.length === 3 && val[1] === "=") {
          throw new OmpTypeError("index signatures cannot specify a default");
        }
        value = parseDef(val, resolve);
        if (isEmbedded(val) && val.hasDefault) {
          throw new OmpTypeError("index signatures cannot specify a default");
        }
      }
      const keyDefinition = originalKey.slice(1, -1);
      const regex = /^\/((?:\\.|[^\\/])*)\/([dgimsuvy]*)$/.exec(keyDefinition);
      let key;
      if (regex === null) {
        key = parseDef(keyDefinition, resolve);
      } else {
        try {
          key = patternIR(new RegExp(regex[1], regex[2]));
        } catch {
          throw new OmpTypeError(`invalid index signature pattern ${keyDefinition}`);
        }
      }
      const objectIndexes = indexes ?? { patterns: [] };
      indexes = objectIndexes;
      indexKeyKind(key, value, props, objectIndexes);
      if (simple && (!isSimpleIR(key) || !isSimpleIR(value)))
        simple = false;
      continue;
    }
    const escapedOptional = typeof originalKey === "string" && originalKey.endsWith("\\?");
    const escapedMeta = typeof originalKey === "string" && (originalKey === "\\+" || originalKey === "\\..." || originalKey.startsWith("\\["));
    const rawKey = escapedOptional ? `${originalKey.slice(0, -2)}?` : escapedMeta ? originalKey.slice(1) : originalKey;
    const opt = typeof rawKey === "string" && !escapedOptional && !escapedMeta && rawKey.endsWith("?");
    const key = opt ? rawKey.slice(0, -1) : rawKey;
    let prop;
    if (typeof val === "string") {
      const parsed = parseStringDef(val, resolve);
      prop = { key, opt: opt || parsed.optional, val: parsed.ir };
      if (parsed.hasDefault) {
        prop.def = parsed.def;
        prop.hasDefault = true;
      }
    } else if (Array.isArray(val) && val.length === 2 && val[1] === "?") {
      prop = { key, opt: true, val: parseDef(val[0], resolve) };
    } else if (Array.isArray(val) && val.length === 3 && val[1] === "=") {
      prop = {
        key,
        opt,
        val: parseDef(val[0], resolve),
        def: val[2],
        defFactory: typeof val[2] === "function",
        hasDefault: true
      };
    } else if (isEmbedded(val)) {
      prop = val.hasDefault ? {
        key,
        opt,
        val: embed(val),
        def: val.hasDefaultOutput ? val.defaultOutput : val.defaultValue,
        defFactory: typeof val.defaultValue === "function",
        hasDefault: true,
        defValidated: val.hasDefaultOutput
      } : { key, opt, val: embed(val) };
    } else {
      prop = {
        key,
        opt,
        val: isObjectDefinition(val) ? parseObjectDefinition(val, resolve) : parseDef(val, resolve)
      };
    }
    if (key !== originalKey) {
      if (!spreadKeys?.has(key) && props.some((candidate) => candidate.key === key)) {
        throw new OmpTypeError(`duplicate object key ${String(key)}`);
      }
      if (normalizedKey === undefined)
        normalizedKey = key;
      else {
        normalizedKeys ??= [normalizedKey];
        normalizedKeys.push(key);
      }
    } else if (!spreadKeys?.has(key) && (key === normalizedKey || normalizedKeys?.includes(key))) {
      throw new OmpTypeError(`duplicate object key ${String(key)}`);
    }
    if (opt && prop.hasDefault)
      throw new OmpTypeError(`optional key ${String(key)} cannot specify a default`);
    if (simple && (prop.hasDefault || !isSimpleIR(prop.val)))
      simple = false;
    addObjectProp(props, spreadKeys, prop);
  }
  for (const key of Object.getOwnPropertySymbols(def)) {
    if (!Object.prototype.propertyIsEnumerable.call(def, key))
      continue;
    const val = def[key];
    let prop;
    if (typeof val === "string") {
      const parsed = parseStringDef(val, resolve);
      prop = { key, opt: parsed.optional, val: parsed.ir };
      if (parsed.hasDefault) {
        prop.def = parsed.def;
        prop.hasDefault = true;
      }
    } else if (Array.isArray(val) && val.length === 2 && val[1] === "?") {
      prop = { key, opt: true, val: parseDef(val[0], resolve) };
    } else if (Array.isArray(val) && val.length === 3 && val[1] === "=") {
      prop = {
        key,
        opt: false,
        val: parseDef(val[0], resolve),
        def: val[2],
        defFactory: typeof val[2] === "function",
        hasDefault: true
      };
    } else if (isEmbedded(val)) {
      prop = val.hasDefault ? {
        key,
        opt: false,
        val: embed(val),
        def: val.hasDefaultOutput ? val.defaultOutput : val.defaultValue,
        defFactory: typeof val.defaultValue === "function",
        hasDefault: true,
        defValidated: val.hasDefaultOutput
      } : { key, opt: false, val: embed(val) };
    } else {
      prop = {
        key,
        opt: false,
        val: isObjectDefinition(val) ? parseObjectDefinition(val, resolve) : parseDef(val, resolve)
      };
    }
    if (simple && (prop.hasDefault || !isSimpleIR(prop.val)))
      simple = false;
    addObjectProp(props, spreadKeys, prop);
  }
  const object = {
    k: "object",
    props,
    index: indexes?.string,
    symbolIndex: indexes?.symbol,
    patternIndexes: indexes === undefined || indexes.patterns.length === 0 ? undefined : indexes.patterns,
    extras
  };
  object[kSimple] = simple;
  object[kSimpleOwner] = object;
  return object;
}
function parseDef(def, resolve) {
  if (typeof def === "string") {
    const parsed = parseStringDef(def, resolve);
    if (parsed.hasDefault) {
      throw new OmpTypeError("A default may only be specified for an object property or tuple element");
    }
    if (parsed.optional) {
      throw new OmpTypeError(`optional "?" marker is only valid on object property values`);
    }
    return parsed.ir;
  }
  if (Array.isArray(def)) {
    if (def.length === 3 && def[1] === "=") {
      throw new OmpTypeError("A default may only be specified for an object property or tuple element");
    }
    return parseArrayExpression(def, resolve);
  }
  if (def instanceof RegExp)
    return patternIR(def);
  if (def instanceof Date)
    return { k: "lit", v: def };
  if (isEmbedded(def))
    return embed(def);
  if (typeof def === "function") {
    const resolved = Reflect.apply(def, undefined, []);
    if (!isEmbedded(resolved)) {
      throw new OmpTypeError(`thunk must return a Type (was ${typeof resolved})`);
    }
    return embed(resolved);
  }
  if (isObjectDefinition(def))
    return parseObjectDefinition(def, resolve);
  throw new OmpTypeError(`unsupported definition ${String(def)} (was ${typeof def})`);
}
function isSimpleIR(ir) {
  const cached = ir[kSimpleOwner] === ir ? ir[kSimple] : undefined;
  if (cached !== undefined)
    return cached;
  const simple = scanSimpleIR(ir);
  ir[kSimple] = simple;
  ir[kSimpleOwner] = ir;
  return simple;
}
function scanSimpleIR(ir) {
  switch (ir.k) {
    case "intersection":
    case "morph":
    case "sub":
    case "alias":
      return false;
    case "refine":
      return scanSimpleIR(ir.base);
    case "union":
      if (ir.members.length < 2)
        return false;
      if (ir.members.length === 2 && ir.members.every((member) => member.k === "lit" && typeof member.v === "boolean")) {
        return false;
      }
      for (let index = 0;index < ir.members.length; index++) {
        const member = ir.members[index];
        if (member.k !== "lit" || member.v !== null && (typeof member.v === "object" || typeof member.v === "function")) {
          return false;
        }
        for (let previous = 0;previous < index; previous++) {
          const candidate = ir.members[previous];
          if (candidate.k === "lit" && candidate.v === member.v)
            return false;
        }
      }
      return true;
    case "array":
      return scanSimpleIR(ir.el);
    case "tuple":
      for (const item of ir.prefix) {
        if (item.hasDefault || !scanSimpleIR(item.val))
          return false;
      }
      if (ir.variadic !== undefined && !scanSimpleIR(ir.variadic))
        return false;
      for (const item of ir.postfix)
        if (!scanSimpleIR(item))
          return false;
      return true;
    case "object":
      if (ir.extras === "delete")
        return false;
      for (const prop of ir.props) {
        if (prop.hasDefault || !scanSimpleIR(prop.val))
          return false;
      }
      if (ir.index !== undefined && !scanSimpleIR(ir.index))
        return false;
      if (ir.symbolIndex !== undefined && !scanSimpleIR(ir.symbolIndex))
        return false;
      if (ir.patternIndexes !== undefined) {
        for (const pattern of ir.patternIndexes) {
          if (!scanSimpleIR(pattern.key) || !scanSimpleIR(pattern.val))
            return false;
        }
      }
      return true;
    default:
      return true;
  }
}
function hasMorph(ir) {
  const cached = ir[kMorphOwner] === ir ? ir[kMorph] : undefined;
  if (cached !== undefined)
    return cached;
  const result = scanMorph(ir);
  ir[kMorph] = result;
  ir[kMorphOwner] = ir;
  return result;
}
function scanMorph(ir, activeAliases) {
  const cached = ir[kMorphOwner] === ir ? ir[kMorph] : undefined;
  if (cached !== undefined)
    return cached;
  let result = false;
  switch (ir.k) {
    case "sub":
    case "morph":
      result = true;
      break;
    case "alias": {
      if (activeAliases?.has(ir))
        return false;
      const aliases = activeAliases ?? new Set;
      aliases.add(ir);
      result = scanMorph(ir.resolve(), aliases);
      aliases.delete(ir);
      return result;
    }
    case "object":
      result = ir.extras === "delete";
      for (let index = 0;!result && index < ir.props.length; index++) {
        const prop = ir.props[index];
        result = prop.hasDefault === true || scanMorph(prop.val, activeAliases);
      }
      if (!result && ir.index !== undefined)
        result = scanMorph(ir.index, activeAliases);
      if (!result && ir.symbolIndex !== undefined)
        result = scanMorph(ir.symbolIndex, activeAliases);
      if (!result && ir.patternIndexes !== undefined) {
        for (const pattern of ir.patternIndexes) {
          if (scanMorph(pattern.val, activeAliases)) {
            result = true;
            break;
          }
        }
      }
      break;
    case "array":
      result = scanMorph(ir.el, activeAliases);
      break;
    case "union":
    case "intersection":
      for (const member of ir.members) {
        if (scanMorph(member, activeAliases)) {
          result = true;
          break;
        }
      }
      break;
    case "refine":
      result = scanMorph(ir.base, activeAliases);
      break;
    case "tuple":
      for (const item of ir.prefix) {
        if (item.hasDefault === true || scanMorph(item.val, activeAliases)) {
          result = true;
          break;
        }
      }
      if (!result && ir.variadic !== undefined)
        result = scanMorph(ir.variadic, activeAliases);
      if (!result) {
        for (const item of ir.postfix) {
          if (scanMorph(item, activeAliases)) {
            result = true;
            break;
          }
        }
      }
      break;
  }
  return result;
}
function hasAlias(ir) {
  const cached = ir[kAliasOwner] === ir ? ir[kAlias] : undefined;
  if (cached !== undefined)
    return cached;
  const result = scanAlias(ir);
  ir[kAlias] = result;
  ir[kAliasOwner] = ir;
  return result;
}
function scanAlias(ir) {
  const cached = ir[kAliasOwner] === ir ? ir[kAlias] : undefined;
  if (cached !== undefined)
    return cached;
  switch (ir.k) {
    case "alias":
      return true;
    case "object":
      for (const prop of ir.props)
        if (scanAlias(prop.val))
          return true;
      if (ir.index !== undefined && scanAlias(ir.index))
        return true;
      if (ir.symbolIndex !== undefined && scanAlias(ir.symbolIndex))
        return true;
      if (ir.patternIndexes !== undefined) {
        for (const pattern of ir.patternIndexes) {
          if (scanAlias(pattern.key) || scanAlias(pattern.val))
            return true;
        }
      }
      return false;
    case "array":
      return scanAlias(ir.el);
    case "tuple":
      for (const item of ir.prefix)
        if (scanAlias(item.val))
          return true;
      if (ir.variadic !== undefined && scanAlias(ir.variadic))
        return true;
      for (const item of ir.postfix)
        if (scanAlias(item))
          return true;
      return false;
    case "union":
    case "intersection":
      for (const member of ir.members)
        if (scanAlias(member))
          return true;
      return false;
    case "refine":
      return scanAlias(ir.base);
    case "morph":
      return scanAlias(ir.input) || ir.out !== undefined && scanAlias(ir.out);
    default:
      return false;
  }
}
function expectedOf(ir) {
  if (ir.desc !== undefined)
    return ir.desc;
  switch (ir.k) {
    case "unknown":
      return "unknown";
    case "null":
      return "null";
    case "undefined":
      return "undefined";
    case "boolean":
      return "boolean";
    case "bigint":
      return "a bigint";
    case "symbol":
      return "a symbol";
    case "never":
      return "never";
    case "anyobject":
      return "an object";
    case "string": {
      let out = ir.url ? "a URL string" : "a string";
      if (ir.min !== undefined && ir.max !== undefined)
        out += ` (length ${ir.min} to ${ir.max})`;
      else if (ir.min !== undefined)
        out += ` (length at least ${ir.min})`;
      else if (ir.max !== undefined)
        out += ` (length at most ${ir.max})`;
      return out;
    }
    case "number": {
      let out = ir.int ? "an integer" : "a number";
      if (ir.min !== undefined)
        out += ` ${ir.xmin ? "more than" : "at least"} ${ir.min}`;
      if (ir.max !== undefined)
        out += `${ir.min !== undefined ? " and" : ""} ${ir.xmax ? "less than" : "at most"} ${ir.max}`;
      if (ir.divisor !== undefined)
        out += ` divisible by ${ir.divisor}`;
      return out;
    }
    case "lit":
      return ir.v instanceof Date ? `the date ${ir.v.toISOString()}` : typeof ir.v === "string" ? JSON.stringify(ir.v) : String(ir.v);
    case "union": {
      if (ir.members.length === 0)
        return "";
      const first = expectedOf(ir.members[0]);
      if (ir.members.length === 1)
        return first;
      const second = expectedOf(ir.members[1]);
      if (ir.members.length === 2)
        return first === second ? first : `${first} or ${second}`;
      const expectations = first === second ? [first] : [first, second];
      for (let i = 2;i < ir.members.length; i++) {
        const expected = expectedOf(ir.members[i]);
        if (!expectations.includes(expected))
          expectations.push(expected);
      }
      return expectations.join(" or ");
    }
    case "intersection":
      return ir.members.map(expectedOf).join(" and ");
    case "array":
      return "an array";
    case "tuple":
      return "a tuple";
    case "object":
      return "an object";
    case "instance":
      return ir.expected;
    case "refine":
      return ir.expected;
    case "morph":
      return expectedOf(ir.input);
    case "alias":
      return ir.name === "this" ? expectedOf(ir.resolve()) : ir.name;
    case "sub":
      return ir.desc ?? ir.schema.description ?? expectedOf(ir.schema.ir);
  }
}

// node_modules/@oh-my-pi/omptype/src/jsonschema/resolve.ts
var VOCAB_APPLICATOR = 1;
var VOCAB_VALIDATION = 2;
var VOCAB_UNEVALUATED = 4;
var VOCAB_ALL = VOCAB_APPLICATOR | VOCAB_VALIDATION | VOCAB_UNEVALUATED;
var SCHEMAS = 1;
var SCHEMA_MAP = 2;
var SUBSCHEMA_KEYWORDS = new Map([
  ["items", SCHEMAS],
  ["additionalItems", SCHEMAS],
  ["prefixItems", SCHEMAS],
  ["contains", SCHEMAS],
  ["additionalProperties", SCHEMAS],
  ["propertyNames", SCHEMAS],
  ["unevaluatedItems", SCHEMAS],
  ["unevaluatedProperties", SCHEMAS],
  ["not", SCHEMAS],
  ["if", SCHEMAS],
  ["then", SCHEMAS],
  ["else", SCHEMAS],
  ["allOf", SCHEMAS],
  ["anyOf", SCHEMAS],
  ["oneOf", SCHEMAS],
  ["contentSchema", SCHEMAS],
  ["properties", SCHEMA_MAP],
  ["patternProperties", SCHEMA_MAP],
  ["$defs", SCHEMA_MAP],
  ["definitions", SCHEMA_MAP],
  ["dependentSchemas", SCHEMA_MAP],
  ["dependencies", SCHEMA_MAP]
]);

// node_modules/@oh-my-pi/omptype/src/jsonschema/runtime.ts
var patterns = new Map;

// node_modules/@oh-my-pi/omptype/src/jsonschema/plan.ts
var T_INTEGER = 4;
var T_NUMBER = 8;
var T_ANY = 127;
var T_NUMERIC = T_NUMBER | T_INTEGER;
var TRUE_PLAN = { types: T_ANY, empty: true, flags: 0 };
var FALSE_PLAN = { types: 0, empty: false, flags: 0 };
var EMPTY_SCOPE = { key: "", anchors: new Map };
var TYPE_PLANS = new Map([
  [T_ANY, TRUE_PLAN],
  [0, FALSE_PLAN]
]);

// node_modules/@oh-my-pi/omptype/src/jsonschema/interpret.ts
var kAnyOf = Symbol("omptype.jsonschema.anyOfTag");
var kOneOf = Symbol("omptype.jsonschema.oneOfTag");

// node_modules/@oh-my-pi/omptype/src/interp.ts
var own = Object.prototype.hasOwnProperty;
function materializeDefault(payload) {
  if (payload === null || typeof payload !== "object")
    return payload;
  if (payload instanceof Date)
    return new Date(payload);
  return structuredClone(payload);
}
var activeVisits;
var activeChecks;
function walk(ir, value, path = []) {
  const previousVisits = activeVisits;
  const previousChecks = activeChecks;
  activeVisits = undefined;
  activeChecks = undefined;
  try {
    return visit2(ir, value, path);
  } finally {
    activeVisits = previousVisits;
    activeChecks = previousChecks;
  }
}
function fail(path, expected, data) {
  const storedPath = path.length === 0 ? undefined : path.length === 1 ? path[0] : [...path];
  return new OmpErrors(storedPath, expected, data);
}
function checks(ir, v) {
  if (typeof v !== "object" || v === null || !hasAlias(ir))
    return checkNode(ir, v);
  activeChecks ??= new WeakMap;
  const visits = activeChecks;
  let visited = visits.get(v);
  if (visited?.has(ir))
    return true;
  if (visited === undefined) {
    visited = new Set;
    visits.set(v, visited);
  }
  visited.add(ir);
  try {
    return checkNode(ir, v);
  } finally {
    visited.delete(ir);
  }
}
function checkNode(ir, v) {
  switch (ir.k) {
    case "unknown":
      return true;
    case "null":
      return v === null;
    case "undefined":
      return v === undefined;
    case "boolean":
      return typeof v === "boolean";
    case "bigint":
      return typeof v === "bigint";
    case "symbol":
      return typeof v === "symbol";
    case "never":
      return false;
    case "anyobject":
      return typeof v === "object" && v !== null;
    case "string":
      return typeof v === "string" && (ir.min === undefined || v.length >= ir.min) && (ir.max === undefined || v.length <= ir.max) && (!ir.url || URL.canParse(v));
    case "number":
      if (typeof v !== "number")
        return false;
      return (ir.int ? Number.isInteger(v) : Number.isFinite(v)) && (ir.divisor === undefined || v % ir.divisor === 0) && (ir.min === undefined || (ir.xmin ? v > ir.min : v >= ir.min)) && (ir.max === undefined || (ir.xmax ? v < ir.max : v <= ir.max));
    case "lit":
      return ir.v instanceof Date ? v instanceof Date && v.valueOf() === ir.v.valueOf() : v === ir.v;
    case "union":
      return ir.members.some((m) => checks(m, v));
    case "intersection":
      return ir.members.every((member) => checks(member, v));
    case "array": {
      if (!Array.isArray(v))
        return false;
      if (ir.min !== undefined && v.length < ir.min)
        return false;
      if (ir.max !== undefined && v.length > ir.max)
        return false;
      for (const element of v)
        if (!checks(ir.el, element))
          return false;
      return true;
    }
    case "tuple": {
      if (!Array.isArray(v))
        return false;
      let required = ir.postfix.length;
      for (const item of ir.prefix)
        if (!item.opt && !item.hasDefault)
          required++;
      if (v.length < required)
        return false;
      if (ir.variadic === undefined && v.length > ir.prefix.length + ir.postfix.length)
        return false;
      const postfixStart = v.length - ir.postfix.length;
      const prefixCount = Math.min(ir.prefix.length, postfixStart);
      for (let index = 0;index < prefixCount; index++) {
        if (!checks(ir.prefix[index].val, v[index]))
          return false;
      }
      for (let index = prefixCount;index < ir.prefix.length; index++) {
        const item = ir.prefix[index];
        if (!item.opt && !item.hasDefault)
          return false;
      }
      if (ir.variadic !== undefined) {
        for (let index = prefixCount;index < postfixStart; index++) {
          if (!checks(ir.variadic, v[index]))
            return false;
        }
      }
      for (let index = 0;index < ir.postfix.length; index++) {
        if (!checks(ir.postfix[index], v[postfixStart + index]))
          return false;
      }
      return true;
    }
    case "object": {
      if (typeof v !== "object" || v === null)
        return false;
      const rec = v;
      for (const p of ir.props) {
        const present = p.key in rec;
        if (!present) {
          if (!p.opt && !p.hasDefault)
            return false;
          continue;
        }
        if (!checks(p.val, rec[p.key]))
          return false;
      }
      for (const key in rec) {
        if (!own.call(rec, key))
          continue;
        if (ir.index !== undefined && !checks(ir.index, rec[key]))
          return false;
        let patternMatched = false;
        if (ir.patternIndexes !== undefined) {
          for (const pattern of ir.patternIndexes) {
            if (!checks(pattern.key, key))
              continue;
            patternMatched = true;
            if (!checks(pattern.val, rec[key]))
              return false;
          }
        }
        if (ir.extras === "reject" && ir.index === undefined && !patternMatched && !ir.props.some((prop) => prop.key === key)) {
          return false;
        }
      }
      for (const key of Object.getOwnPropertySymbols(rec)) {
        if (!Object.prototype.propertyIsEnumerable.call(rec, key))
          continue;
        if (ir.symbolIndex !== undefined && !checks(ir.symbolIndex, rec[key]))
          return false;
        if (ir.extras === "reject" && ir.symbolIndex === undefined && !ir.props.some((prop) => prop.key === key)) {
          return false;
        }
      }
      return true;
    }
    case "instance":
      return v instanceof ir.ctor;
    case "refine":
      if (!checks(ir.base, v))
        return false;
      if (ir.check !== undefined)
        return ir.check(v);
      try {
        return ir.pred(v) === true;
      } catch {
        return false;
      }
    case "alias":
      return checks(ir.resolve(), v);
    case "morph":
      return checks(ir.input, v);
    case "sub":
      return !(ir.schema.run(v) instanceof OmpErrors);
  }
}
function visit2(ir, v, path) {
  if (typeof v !== "object" || v === null || !hasAlias(ir))
    return visitFinish(ir, v, path);
  activeVisits ??= new WeakMap;
  const visits = activeVisits;
  let visited = visits.get(v);
  if (visited?.has(ir))
    return v;
  if (visited === undefined) {
    visited = new Set;
    visits.set(v, visited);
  }
  visited.add(ir);
  try {
    return visitFinish(ir, v, path);
  } finally {
    visited.delete(ir);
  }
}
function visitFinish(ir, v, path) {
  const out = visitNode(ir, v, path);
  if (!(out instanceof OmpErrors) || ir.cfg === undefined)
    return out;
  for (const error of out) {
    if (error.path.length !== path.length)
      return out;
  }
  return out.configure(ir.cfg);
}
function visitNode(ir, v, path) {
  switch (ir.k) {
    case "alias":
      return visit2(ir.resolve(), v, path);
    case "refine": {
      const base = visit2(ir.base, v, path);
      if (base instanceof OmpErrors)
        return base;
      try {
        const result = ir.pred(base);
        if (result instanceof OmpErrors)
          return path.length === 0 ? result : prefixAll(result, path);
        return result ? base : fail(path, ir.expected, base);
      } catch {
        return fail(path, ir.expected, base);
      }
    }
    case "morph": {
      const input = visit2(ir.input, v, path);
      if (input instanceof OmpErrors)
        return input;
      const context = {
        error: (expected, data = input) => fail(path, expected, data),
        reject: (problem, data = input) => fail(path, problem, data)
      };
      const output = ir.fn(input, context);
      if (output instanceof OmpErrors)
        return output;
      return ir.out === undefined ? output : visit2(ir.out, output, path);
    }
    case "intersection": {
      let output = v;
      for (const member of ir.members) {
        output = visit2(member, output, path);
        if (output instanceof OmpErrors)
          return output;
      }
      return output;
    }
    case "sub": {
      const out = ir.schema.run(v, path);
      if (out instanceof OmpErrors) {
        return path.length === 0 ? out : prefixAll(out, path);
      }
      return out;
    }
    case "union": {
      for (const m of ir.members) {
        if (m.k !== "sub" && checks(m, v)) {
          if (hasMorph(m))
            break;
          return v;
        }
      }
      let targeted;
      let targetCount = 0;
      for (const member of ir.members) {
        if (member.k === "sub" || hasMorph(member)) {
          const out = visit2(member, v, path);
          if (!(out instanceof OmpErrors))
            return out;
          if (kindMatches(unwrapBase(member), v)) {
            targetCount++;
            targeted ??= out;
          }
        }
      }
      if (targetCount === 1 && targeted !== undefined)
        return targeted;
      return ir.members.some(canRefineUnionFailure) ? unionFail(ir, v, path) : fail(path, expectedOf(ir), v);
    }
    case "array": {
      if (!Array.isArray(v))
        return fail(path, "an array", v);
      if (ir.min !== undefined && v.length < ir.min)
        return fail(path, `at least length ${ir.min}`, v.length);
      if (ir.max !== undefined && v.length > ir.max)
        return fail(path, `at most length ${ir.max}`, v.length);
      const morph = hasMorph(ir.el);
      const out = morph ? new Array(v.length) : v;
      let errors;
      for (let index = 0;index < v.length; index++) {
        path.push(index);
        const element = visit2(ir.el, v[index], path);
        path.pop();
        if (element instanceof OmpErrors) {
          if (errors)
            errors.append(element);
          else
            errors = element;
        } else if (morph) {
          out[index] = element;
        }
      }
      return errors ?? out;
    }
    case "tuple": {
      if (!Array.isArray(v))
        return fail(path, "an array", v);
      let required = ir.postfix.length;
      for (const item of ir.prefix)
        if (!item.opt && !item.hasDefault)
          required++;
      if (v.length < required)
        return fail(path, `an array of at least length ${required}`, v);
      const maximum = ir.prefix.length + ir.postfix.length;
      if (ir.variadic === undefined && v.length > maximum) {
        return fail(path, `an array of at most length ${maximum}`, v);
      }
      const postfixStart = v.length - ir.postfix.length;
      const prefixCount = Math.min(ir.prefix.length, postfixStart);
      const morph = hasMorph(ir);
      const output = morph ? [...v] : v;
      let errors;
      for (let index = 0;index < prefixCount; index++) {
        path.push(index);
        const item = visit2(ir.prefix[index].val, v[index], path);
        path.pop();
        if (item instanceof OmpErrors) {
          if (errors)
            errors.append(item);
          else
            errors = item;
        } else if (morph) {
          output[index] = item;
        }
      }
      for (let index = prefixCount;index < ir.prefix.length; index++) {
        const item = ir.prefix[index];
        if (item.hasDefault && morph) {
          const payload = item.def;
          if (item.defFactory && typeof payload === "function") {
            path.push(index);
            const resolved = visit2(item.val, payload(), path);
            path.pop();
            if (resolved instanceof OmpErrors) {
              if (errors)
                errors.append(resolved);
              else
                errors = resolved;
            } else {
              output[index] = resolved;
            }
          } else {
            output[index] = materializeDefault(payload);
          }
        } else if (!item.opt) {
          path.push(index);
          const error = fail(path, expectedOf(item.val), MISSING);
          path.pop();
          if (errors)
            errors.append(error);
          else
            errors = error;
        }
      }
      if (ir.variadic !== undefined) {
        for (let index = prefixCount;index < postfixStart; index++) {
          path.push(index);
          const item = visit2(ir.variadic, v[index], path);
          path.pop();
          if (item instanceof OmpErrors) {
            if (errors)
              errors.append(item);
            else
              errors = item;
          } else if (morph) {
            output[index] = item;
          }
        }
      }
      for (let index = 0;index < ir.postfix.length; index++) {
        const inputIndex = postfixStart + index;
        path.push(inputIndex);
        const item = visit2(ir.postfix[index], v[inputIndex], path);
        path.pop();
        if (item instanceof OmpErrors) {
          if (errors)
            errors.append(item);
          else
            errors = item;
        } else if (morph) {
          output[inputIndex] = item;
        }
      }
      return errors ?? output;
    }
    case "object": {
      if (typeof v !== "object" || v === null)
        return fail(path, "an object", v);
      const rec = v;
      const morph = hasMorph(ir);
      let out;
      let errors;
      if (morph) {
        if (ir.extras === "delete" && ir.index === undefined && ir.symbolIndex === undefined && ir.patternIndexes === undefined) {
          out = {};
        } else {
          out = { ...rec };
        }
      }
      for (const p of ir.props) {
        if (!(p.key in rec)) {
          if (p.hasDefault && out) {
            const payload = p.def;
            if (p.defFactory && typeof payload === "function") {
              path.push(p.key);
              const resolved = visit2(p.val, payload(), path);
              path.pop();
              if (resolved instanceof OmpErrors) {
                if (errors)
                  errors.append(resolved);
                else
                  errors = resolved;
              } else {
                out[p.key] = resolved;
              }
            } else {
              out[p.key] = materializeDefault(payload);
            }
            continue;
          }
          if (p.opt || p.hasDefault)
            continue;
          path.push(p.key);
          const error = fail(path, expectedOf(p.val), MISSING);
          path.pop();
          if (errors)
            errors.append(error);
          else
            errors = error;
          continue;
        }
        path.push(p.key);
        const result = visit2(p.val, rec[p.key], path);
        path.pop();
        if (result instanceof OmpErrors) {
          if (errors)
            errors.append(result);
          else
            errors = result;
        } else if (out) {
          out[p.key] = result;
        }
      }
      for (const key in rec) {
        if (!own.call(rec, key))
          continue;
        let indexed = false;
        if (ir.index !== undefined) {
          indexed = true;
          path.push(key);
          const result = visit2(ir.index, rec[key], path);
          path.pop();
          if (result instanceof OmpErrors) {
            if (errors)
              errors.append(result);
            else
              errors = result;
          } else if (out) {
            out[key] = result;
          }
        }
        if (ir.patternIndexes !== undefined) {
          for (const pattern of ir.patternIndexes) {
            if (!checks(pattern.key, key))
              continue;
            indexed = true;
            path.push(key);
            const result = visit2(pattern.val, rec[key], path);
            path.pop();
            if (result instanceof OmpErrors) {
              if (errors)
                errors.append(result);
              else
                errors = result;
            } else if (out) {
              out[key] = result;
            }
          }
        }
        if (ir.extras === "reject" && !indexed && !ir.props.some((prop) => prop.key === key)) {
          path.push(key);
          const error = fail(path, "removed", rec[key]);
          path.pop();
          if (errors)
            errors.append(error);
          else
            errors = error;
        }
      }
      for (const key of Object.getOwnPropertySymbols(rec)) {
        if (!Object.prototype.propertyIsEnumerable.call(rec, key))
          continue;
        if (ir.symbolIndex !== undefined) {
          path.push(key);
          const result = visit2(ir.symbolIndex, rec[key], path);
          path.pop();
          if (result instanceof OmpErrors) {
            if (errors)
              errors.append(result);
            else
              errors = result;
          } else if (out) {
            out[key] = result;
          }
        } else if (ir.extras === "reject" && !ir.props.some((prop) => prop.key === key)) {
          path.push(key);
          const error = fail(path, "removed", rec[key]);
          path.pop();
          if (errors)
            errors.append(error);
          else
            errors = error;
        }
      }
      return errors ?? out ?? v;
    }
    case "string": {
      if (typeof v !== "string")
        return fail(path, "a string", v);
      if (ir.min !== undefined && v.length < ir.min)
        return fail(path, `at least length ${ir.min}`, v.length);
      if (ir.max !== undefined && v.length > ir.max)
        return fail(path, `at most length ${ir.max}`, v.length);
      if (ir.url && !URL.canParse(v))
        return fail(path, "a URL string", v);
      return v;
    }
    case "number": {
      if (typeof v !== "number" || !Number.isFinite(v))
        return fail(path, ir.int ? "an integer" : "a number", v);
      let errors;
      const add = (expected) => {
        const error = fail(path, expected, v);
        if (errors)
          errors.append(error);
        else
          errors = error;
      };
      if (ir.int && !Number.isInteger(v))
        add("an integer");
      if (ir.divisor !== undefined && v % ir.divisor !== 0)
        add(`a number divisible by ${ir.divisor}`);
      if (ir.min !== undefined && (ir.xmin ? v <= ir.min : v < ir.min)) {
        add(ir.min === 0 ? ir.xmin ? "positive" : "non-negative" : `a number ${ir.xmin ? "more than" : "at least"} ${ir.min}`);
      }
      if (ir.max !== undefined && (ir.xmax ? v >= ir.max : v > ir.max)) {
        add(ir.max === 0 ? ir.xmax ? "negative" : "non-positive" : `a number ${ir.xmax ? "less than" : "at most"} ${ir.max}`);
      }
      return errors ?? v;
    }
    case "lit": {
      if (checks(ir, v))
        return v;
      if (typeof ir.v === "object" && ir.v !== null || typeof ir.v === "function") {
        let expected = "the specified reference";
        try {
          const serialized = JSON.stringify(ir.v);
          if (serialized !== undefined) {
            expected = `reference equal to ${serialized}`;
            if (typeof v === "object" && v !== null && JSON.stringify(v) === serialized) {
              expected += " (serialized to the same value)";
            }
          }
        } catch {}
        return fail(path, expected, v);
      }
      return fail(path, expectedOf(ir), v);
    }
    default:
      return checks(ir, v) ? v : fail(path, expectedOf(ir), v);
  }
}
function prefixAll(errs, path) {
  for (let i = path.length - 1;i >= 0; i--)
    errs.prefix(path[i]);
  return errs;
}
function canRefineUnionFailure(member) {
  const base = unwrapBase(member);
  if (base.k === "array" || base.k === "object")
    return true;
  if (base.k === "string")
    return base.min !== undefined || base.max !== undefined || base.url === true;
  return base.k === "number" && (base.int === true || base.min !== undefined || base.max !== undefined);
}
function unionFail(ir, v, path, expected) {
  let best;
  for (const member of ir.members) {
    const base = unwrapBase(member);
    if (!kindMatches(base, v))
      continue;
    if (best !== undefined) {
      best = undefined;
      break;
    }
    best = member;
  }
  if (best === undefined) {
    const discriminated = discriminateFailure(ir.members, v, path);
    if (discriminated !== undefined)
      return discriminated;
  }
  if (best !== undefined) {
    const out = visit2(best, v, path);
    if (out instanceof OmpErrors)
      return out;
  }
  if (ir.members.every((member) => unwrapBase(member).k === "object")) {
    const branches = ir.members.flatMap((member) => {
      const result = visit2(member, v, path);
      return result instanceof OmpErrors ? [[...result]] : [];
    });
    if (branches.length !== 0) {
      const common = branches[0].filter((entry, index, first) => first.findIndex((candidate) => pathsEqual(candidate.path, entry.path)) === index && branches.every((branch) => branch.some((candidate) => pathsEqual(candidate.path, entry.path))));
      const alternatives = [];
      if (common.length !== 0) {
        for (const entry of common) {
          const expectations = new Set;
          for (const branch of branches) {
            for (const candidate of branch) {
              if (pathsEqual(candidate.path, entry.path)) {
                expectations.add(candidate.expected.endsWith(" instance") ? "an object" : candidate.expected);
              }
            }
          }
          alternatives.push(new OmpErrors(entry.path, [...expectations].join(" or "), entry.data, { preserveActual: true }));
        }
      } else {
        for (const branch of branches) {
          for (const entry of branch) {
            alternatives.push(new OmpErrors(entry.path, entry.expected.endsWith(" instance") ? "an object" : entry.expected, entry.data, { preserveActual: true }));
          }
        }
      }
      const combined = alternatives[0];
      for (let index = 1;index < alternatives.length; index++)
        combined.append(alternatives[index]);
      return alternatives.length === 1 ? combined : combined.asAlternatives();
    }
  }
  return fail(path, expected ?? expectedOf(ir), v);
}
function unwrapBase(member, seen = new Set) {
  if (seen.has(member))
    return member;
  seen.add(member);
  if (member.k === "sub")
    return unwrapBase(member.schema.ir, seen);
  if (member.k === "alias")
    return unwrapBase(member.resolve(), seen);
  if (member.k === "refine")
    return unwrapBase(member.base, seen);
  return member;
}
function collectDiscriminants(member, prefix = [], seen = new Set) {
  if (seen.has(member))
    return [];
  seen.add(member);
  if (member.k === "alias")
    return collectDiscriminants(member.resolve(), prefix, seen);
  if (member.k === "sub")
    return collectDiscriminants(member.schema.ir, prefix, seen);
  if (member.k === "refine")
    return collectDiscriminants(member.base, prefix, seen);
  if (member.k !== "object")
    return [];
  const result = [];
  for (const property of member.props) {
    const propertyPath = [...prefix, property.key];
    const value = unwrapBase(property.val);
    if (value.k === "lit")
      result.push({ path: propertyPath, value: value.v });
    else
      result.push(...collectDiscriminants(property.val, propertyPath, new Set(seen)));
  }
  return result;
}
function pathsEqual(left, right) {
  return left.length === right.length && left.every((key, index) => key === right[index]);
}
function valueAtPath(value, path) {
  let cursor = value;
  for (const key of path) {
    if (typeof cursor !== "object" && typeof cursor !== "function" || cursor === null || !(key in cursor)) {
      return { present: false };
    }
    cursor = cursor[key];
  }
  return { present: true, value: cursor };
}
function discriminateFailure(members, value, path) {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return;
  const byMember = members.map((member) => collectDiscriminants(member));
  const candidates = [];
  for (const discriminants of byMember) {
    for (const discriminant of discriminants) {
      if (candidates.some((candidate) => pathsEqual(candidate.path, discriminant.path)))
        continue;
      const values = [];
      let declared = 0;
      for (const branch of byMember) {
        const match = branch.find((candidate) => pathsEqual(candidate.path, discriminant.path));
        if (match === undefined)
          continue;
        declared++;
        if (!values.some((candidate) => Object.is(candidate, match.value)))
          values.push(match.value);
      }
      if (values.length > 1)
        candidates.push({ path: discriminant.path, distinct: values.length, declared });
    }
  }
  candidates.sort((left, right) => right.distinct - left.distinct || right.declared - left.declared);
  for (const candidate of candidates) {
    const actual = valueAtPath(value, candidate.path);
    const exact = [];
    const defaults = [];
    const expectedMembers = [];
    for (let index = 0;index < members.length; index++) {
      const discriminant = byMember[index].find((item) => pathsEqual(item.path, candidate.path));
      if (discriminant === undefined) {
        defaults.push(members[index]);
        continue;
      }
      expectedMembers.push({ k: "lit", v: discriminant.value });
      if (actual.present && Object.is(actual.value, discriminant.value))
        exact.push(members[index]);
    }
    if (!actual.present) {
      if (defaults.length !== 0 && defaults.length < members.length) {
        return discriminateFailure(defaults, value, path);
      }
      return fail([...path, ...candidate.path], expectedOf({ k: "union", members: expectedMembers }), undefined);
    }
    if (exact.length === 0) {
      if (defaults.length !== 0)
        return discriminateFailure(defaults, value, path);
      return fail([...path, ...candidate.path], expectedOf({ k: "union", members: expectedMembers }), actual.value);
    }
    if (exact.length === 1) {
      const result = visit2(exact[0], value, path);
      return result instanceof OmpErrors ? result : undefined;
    }
    const nested = discriminateFailure(exact, value, path);
    if (nested !== undefined)
      return nested;
  }
  return;
}
function kindMatches(base, v) {
  switch (base.k) {
    case "array":
      return Array.isArray(v);
    case "object":
    case "anyobject":
      return typeof v === "object" && v !== null && !Array.isArray(v);
    case "string":
      return typeof v === "string";
    case "number":
      return typeof v === "number";
    default:
      return false;
  }
}

// node_modules/@oh-my-pi/omptype/src/compile.ts
var own2 = Object.prototype.hasOwnProperty;
var IDENT = /^[A-Za-z_$][\w$]*$/;
function litSource(v) {
  if (v === null)
    return "null";
  if (v === undefined)
    return "undefined";
  switch (typeof v) {
    case "string":
    case "boolean":
      return JSON.stringify(v);
    case "number":
      return Number.isFinite(v) ? String(v) : undefined;
    default:
      return;
  }
}
function isPrimitiveLiteral(node) {
  return node.k === "lit" && (node.v === null || typeof node.v !== "object" && typeof node.v !== "function");
}
function rejectsUndefined(node) {
  switch (node.k) {
    case "unknown":
    case "undefined":
    case "alias":
    case "sub":
      return false;
    case "lit":
      return node.v !== undefined;
    case "union":
      return node.members.every(rejectsUndefined);
    case "intersection":
      return node.members.some(rejectsUndefined);
    case "refine":
      return rejectsUndefined(node.base);
    case "morph":
      return rejectsUndefined(node.input);
    default:
      return true;
  }
}

class CompiledMorphContext {
  #path;
  #data;
  constructor(path, data) {
    this.#path = path;
    this.#data = data;
  }
  error(expectation) {
    return new OmpErrors(this.#path, expectation, this.#data);
  }
  reject(expectation) {
    return this.error(expectation);
  }
}

class Builder {
  #lines = [];
  #refs = [];
  #activeAliases;
  #id = 0;
  next(prefix) {
    return `${prefix}${this.#id++}`;
  }
  push(line) {
    this.#lines.push(line);
  }
  ref(value) {
    const idx = this.#refs.indexOf(value);
    if (idx >= 0)
      return `R[${idx}]`;
    this.#refs.push(value);
    return `R[${this.#refs.length - 1}]`;
  }
  lit(v) {
    return litSource(v) ?? this.ref(v);
  }
  access(base, key) {
    return typeof key === "string" && IDENT.test(key) ? `${base}.${key}` : `${base}[${this.lit(key)}]`;
  }
  pathExpr(segs) {
    const parts = segs.map((seg) => ("s" in seg) ? this.lit(seg.s) : seg.d);
    return `[${parts.join(",")}]`;
  }
  storedPathExpr(segs) {
    if (segs.length === 0)
      return "undefined";
    if (segs.length === 1) {
      const seg = segs[0];
      return "s" in seg ? this.lit(seg.s) : seg.d;
    }
    const staticParts = [];
    for (const seg of segs) {
      if ("d" in seg)
        return this.pathExpr(segs);
      staticParts.push(seg.s);
    }
    return this.ref(staticParts);
  }
  error(segs, expected, dataExpr) {
    return `new AE(${this.storedPathExpr(segs)},${JSON.stringify(expected)},${dataExpr})`;
  }
  fail(segs, expected, dataExpr) {
    return `return ${this.error(segs, expected, dataExpr)}`;
  }
  appendError(errors, error) {
    return `if(${errors}===undefined)${errors}=${error};else ${errors}.append(${error});`;
  }
  predicate(node, v) {
    switch (node.k) {
      case "unknown":
        return "true";
      case "null":
        return `${v}===null`;
      case "undefined":
        return `${v}===undefined`;
      case "boolean":
        return `typeof ${v}==="boolean"`;
      case "bigint":
        return `typeof ${v}==="bigint"`;
      case "symbol":
        return `typeof ${v}==="symbol"`;
      case "never":
        return "false";
      case "anyobject":
        return `(typeof ${v}==="object"&&${v}!==null)`;
      case "lit":
        return node.v instanceof Date ? `(${v} instanceof Date&&${v}.valueOf()===${node.v.valueOf()})` : `${v}===${this.lit(node.v)}`;
      case "instance":
        return `${v} instanceof ${this.ref(node.ctor)}`;
      case "string": {
        let out = `typeof ${v}==="string"`;
        if (node.min !== undefined)
          out += `&&${v}.length>=${node.min}`;
        if (node.max !== undefined)
          out += `&&${v}.length<=${node.max}`;
        if (node.url)
          out += `&&URL.canParse(${v})`;
        return out;
      }
      case "number": {
        let out = node.int ? `Number.isInteger(${v})` : `Number.isFinite(${v})`;
        if (node.divisor !== undefined)
          out += `&&${v}%${node.divisor}===0`;
        if (node.min !== undefined)
          out += `&&${v}${node.xmin ? ">" : ">="}${node.min}`;
        if (node.max !== undefined)
          out += `&&${v}${node.xmax ? "<" : "<="}${node.max}`;
        return out;
      }
      case "union": {
        const lits = node.members.filter(isPrimitiveLiteral);
        if (lits.length > 8) {
          const values = this.ref(new Set(lits.map((member) => member.v)));
          const literalNodes = new Set(lits);
          const rest = node.members.filter((member) => !literalNodes.has(member));
          let out = `${values}.has(${v})`;
          for (const m of rest)
            out += `||(${this.predicate(m, v)})`;
          return `(${out})`;
        }
        return `(${node.members.map((m) => `(${this.predicate(m, v)})`).join("||")})`;
      }
      case "intersection":
        return `(${node.members.map((member) => `(${this.predicate(member, v)})`).join("&&")})`;
      case "array": {
        const array = this.next("a");
        const index = this.next("i");
        let out = `Array.isArray(${v})`;
        if (node.min !== undefined)
          out += `&&${v}.length>=${node.min}`;
        if (node.max !== undefined)
          out += `&&${v}.length<=${node.max}`;
        const item = `${array}[${index}]`;
        out += `&&((${array})=>{for(let ${index}=0;${index}<${array}.length;${index}++)if(!(${this.predicate(node.el, item)}))return false;return true})(${v})`;
        return out;
      }
      case "object": {
        const checks = [`typeof ${v}==="object"`, `${v}!==null`];
        for (const p of node.props) {
          const av = this.access(v, p.key);
          const present = `${this.lit(p.key)} in ${v}`;
          const predicate = this.predicate(p.val, av);
          checks.push(p.opt || p.hasDefault ? rejectsUndefined(p.val) ? `((${av}!==undefined&&(${predicate}))||!(${present}))` : `(!(${present})||(${predicate}))` : rejectsUndefined(p.val) ? predicate : `((${present})&&(${predicate}))`);
        }
        const stringKey = this.next("k");
        if (node.index !== undefined) {
          checks.push(`(()=>{for(const ${stringKey} in ${v})if(own.call(${v},${stringKey})&&!(${this.predicate(node.index, `${v}[${stringKey}]`)}))return false;return true})()`);
        }
        if (node.patternIndexes !== undefined) {
          for (const pattern of node.patternIndexes) {
            checks.push(`(()=>{for(const ${stringKey} in ${v})if(own.call(${v},${stringKey})&&(${this.predicate(pattern.key, stringKey)})&&!(${this.predicate(pattern.val, `${v}[${stringKey}]`)}))return false;return true})()`);
          }
        }
        if (node.symbolIndex !== undefined) {
          const symbol = this.next("s");
          checks.push(`(()=>{for(const ${symbol} of Object.getOwnPropertySymbols(${v}))if(Object.prototype.propertyIsEnumerable.call(${v},${symbol})&&!(${this.predicate(node.symbolIndex, `${v}[${symbol}]`)}))return false;return true})()`);
        }
        if (node.extras === "reject") {
          const patternMatch = node.patternIndexes?.map((pattern) => `(${this.predicate(pattern.key, stringKey)})`).join("||") ?? "false";
          if (node.index === undefined) {
            checks.push(`(()=>{for(const ${stringKey} in ${v})if(own.call(${v},${stringKey})&&!(${this.declaredCheck(node.props, stringKey)})&&!(${patternMatch}))return false;return true})()`);
          }
          if (node.symbolIndex === undefined) {
            const symbol = this.next("s");
            checks.push(`(()=>{for(const ${symbol} of Object.getOwnPropertySymbols(${v}))if(Object.prototype.propertyIsEnumerable.call(${v},${symbol})&&!(${this.declaredCheck(node.props, symbol)}))return false;return true})()`);
          }
        }
        return `(${checks.join("&&")})`;
      }
      case "sub":
        return `!(${this.ref(node.schema.run)}(${v}) instanceof AE)`;
      case "refine":
        if (node.check !== undefined)
          return `(${this.predicate(node.base, v)})&&${this.ref(node.check)}(${v})`;
        return `!(${this.ref(boundWalk(node))}(${v}) instanceof AE)`;
      default:
        return `!(${this.ref(boundWalk(node))}(${v}) instanceof AE)`;
    }
  }
  declaredCheck(props, keyVar) {
    if (props.length === 0)
      return "false";
    if (props.length > 6) {
      const set = this.ref(new Set(props.map((p) => p.key)));
      return `${set}.has(${keyVar})`;
    }
    return `(${props.map((p) => `${keyVar}===${this.lit(p.key)}`).join("||")})`;
  }
  emitCollectDelegate(node, v, segs, errors, brk, out) {
    const sub = node.k === "sub";
    const runner = sub ? node.schema.run : boundWalk(node);
    const result = this.next("r");
    const args = segs.length > 0 ? `${v},${this.pathExpr(segs)}` : v;
    this.push(`const ${result}=${this.ref(runner)}(${args});`);
    const failure = sub && segs.length > 0 ? `PF(${result},${this.pathExpr(segs)})` : result;
    this.push(`if(${result} instanceof AE){${this.appendError(errors, failure)}${brk === undefined ? "" : `break ${brk};`}}`);
    if (out !== undefined)
      this.push(`${out}=${result};`);
  }
  markErrors(errors) {
    const mark = this.next("n");
    this.push(`const ${mark}=${errors}===void 0?0:${errors}.length;`);
    return mark;
  }
  guardGrowth(errors, mark, brk) {
    this.push(`if((${errors}===void 0?0:${errors}.length)!==${mark})break ${brk};`);
  }
  emitCollectCheck(node, v, segs, errors, failureData = v) {
    if (node.cfg !== undefined || node.k === "refine") {
      this.emitCollectDelegate(node, v, segs, errors);
      return;
    }
    switch (node.k) {
      case "unknown":
        return;
      case "array": {
        this.push(`if(!Array.isArray(${v})){${this.appendError(errors, this.error(segs, "an array", failureData))}}`);
        if (node.min !== undefined) {
          this.push(`else if(${v}.length<${node.min}){${this.appendError(errors, this.error(segs, `at least length ${node.min}`, `${v}.length`))}}`);
        }
        if (node.max !== undefined) {
          this.push(`else if(${v}.length>${node.max}){${this.appendError(errors, this.error(segs, `at most length ${node.max}`, `${v}.length`))}}`);
        }
        this.push("else{");
        const index = this.next("i");
        this.push(`for(let ${index}=0;${index}<${v}.length;${index}++){`);
        this.emitCollectCheck(node.el, `${v}[${index}]`, [...segs, { d: index }], errors);
        this.push("}}");
        return;
      }
      case "tuple": {
        this.push(`if(!Array.isArray(${v})){${this.appendError(errors, this.error(segs, "an array", failureData))}}else{`);
        const requiredPrefix = node.prefix.filter((item) => !item.opt && !item.hasDefault).length;
        const minimum = requiredPrefix + node.postfix.length;
        const maximum = node.prefix.length + node.postfix.length;
        if (minimum > 0) {
          this.push(`if(${v}.length<${minimum}){${this.appendError(errors, this.error(segs, `an array of at least length ${minimum}`, failureData))}}else{`);
        }
        if (node.variadic === undefined) {
          this.push(`if(${v}.length>${maximum}){${this.appendError(errors, this.error(segs, `an array of at most length ${maximum}`, failureData))}}else{`);
        }
        let postfixStart = `${v}.length`;
        if (node.postfix.length > 0) {
          postfixStart = this.next("p");
          this.push(`const ${postfixStart}=${v}.length-${node.postfix.length};`);
        }
        let prefixCount = String(node.prefix.length);
        if (requiredPrefix !== node.prefix.length) {
          prefixCount = this.next("n");
          this.push(`const ${prefixCount}=Math.min(${node.prefix.length},${postfixStart});`);
        }
        for (let index = 0;index < node.prefix.length; index++) {
          if (index >= requiredPrefix)
            this.push(`if(${index}<${prefixCount}){`);
          this.emitCollectCheck(node.prefix[index].val, `${v}[${index}]`, [...segs, { d: String(index) }], errors);
          if (index >= requiredPrefix)
            this.push("}");
        }
        if (node.variadic !== undefined) {
          const index = this.next("i");
          this.push(`for(let ${index}=${prefixCount};${index}<${postfixStart};${index}++){`);
          this.emitCollectCheck(node.variadic, `${v}[${index}]`, [...segs, { d: index }], errors);
          this.push("}");
        }
        for (let index = 0;index < node.postfix.length; index++) {
          const inputIndex = index === 0 ? postfixStart : `${postfixStart}+${index}`;
          this.emitCollectCheck(node.postfix[index], `${v}[${inputIndex}]`, [...segs, { d: inputIndex }], errors);
        }
        if (node.variadic === undefined)
          this.push("}");
        if (minimum > 0)
          this.push("}");
        this.push("}");
        return;
      }
      case "object": {
        if (node.patternIndexes !== undefined || node.symbolIndex !== undefined || node.props.some((prop) => typeof prop.key === "symbol")) {
          this.emitCollectDelegate(node, v, segs, errors);
          return;
        }
        this.push(`if(typeof ${v}!=="object"||${v}===null){${this.appendError(errors, this.error(segs, "an object", failureData))}}else{`);
        for (const prop of node.props) {
          const present = `${this.lit(prop.key)} in ${v}`;
          const propSegs = [...segs, { s: prop.key }];
          if (prop.opt || prop.hasDefault) {
            this.push(`if(${present}){`);
            this.emitCollectCheck(prop.val, this.access(v, prop.key), propSegs, errors);
            this.push("}");
          } else {
            this.push(`if(!(${present})){${this.appendError(errors, this.error(propSegs, expectedOf(prop.val), "M"))}}else{`);
            this.emitCollectCheck(prop.val, this.access(v, prop.key), propSegs, errors);
            this.push("}");
          }
        }
        if (node.index !== undefined) {
          const key = this.next("k");
          this.push(`for(const ${key} in ${v})if(own.call(${v},${key})){`);
          this.emitCollectCheck(node.index, `${v}[${key}]`, [...segs, { d: key }], errors);
          this.push("}");
        } else if (node.extras === "reject") {
          const key = this.next("k");
          this.push(`for(const ${key} in ${v})if(own.call(${v},${key})&&!(${this.declaredCheck(node.props, key)})){`);
          this.push(this.appendError(errors, this.error([...segs, { d: key }], "removed", `${v}[${key}]`)));
          this.push("}");
        }
        if (node.extras === "reject") {
          const symbol = this.next("s");
          this.push(`for(const ${symbol} of Object.getOwnPropertySymbols(${v}))if(Object.prototype.propertyIsEnumerable.call(${v},${symbol})&&!(${this.declaredCheck(node.props, symbol)})){${this.appendError(errors, this.error([...segs, { d: symbol }], "removed", `${v}[${symbol}]`))}}`);
        }
        this.push("}");
        return;
      }
      case "union": {
        const failure = node.members.some(canRefineUnionFailure) ? `UF(${this.ref(node)},${failureData},${this.pathExpr(segs)},${JSON.stringify(expectedOf(node))})` : this.error(segs, expectedOf(node), failureData);
        this.push(`if(!(${this.predicate(node, v)})){${this.appendError(errors, failure)}}`);
        return;
      }
      case "string": {
        this.push(`if(typeof ${v}!=="string"){${this.appendError(errors, this.error(segs, "a string", failureData))}}`);
        if (node.min !== undefined) {
          this.push(`else if(${v}.length<${node.min}){${this.appendError(errors, this.error(segs, `at least length ${node.min}`, `${v}.length`))}}`);
        }
        if (node.max !== undefined) {
          this.push(`else if(${v}.length>${node.max}){${this.appendError(errors, this.error(segs, `at most length ${node.max}`, `${v}.length`))}}`);
        }
        if (node.url) {
          this.push(`else if(!URL.canParse(${v})){${this.appendError(errors, this.error(segs, "a URL string", failureData))}}`);
        }
        return;
      }
      case "number": {
        this.push(`if(typeof ${v}!=="number"||!Number.isFinite(${v})){${this.appendError(errors, this.error(segs, node.int ? "an integer" : "a number", failureData))}}else{`);
        if (node.int) {
          this.push(`if(!Number.isInteger(${v})){${this.appendError(errors, this.error(segs, "an integer", failureData))}}`);
        }
        if (node.divisor !== undefined) {
          this.push(`if(${v}%${node.divisor}!==0){${this.appendError(errors, this.error(segs, `a number divisible by ${node.divisor}`, failureData))}}`);
        }
        if (node.min !== undefined) {
          const expected = node.min === 0 ? node.xmin ? "positive" : "non-negative" : `a number ${node.xmin ? "more than" : "at least"} ${node.min}`;
          this.push(`if(${v}${node.xmin ? "<=" : "<"}${node.min}){${this.appendError(errors, this.error(segs, expected, failureData))}}`);
        }
        if (node.max !== undefined) {
          const expected = node.max === 0 ? node.xmax ? "negative" : "non-positive" : `a number ${node.xmax ? "less than" : "at most"} ${node.max}`;
          this.push(`if(${v}${node.xmax ? ">=" : ">"}${node.max}){${this.appendError(errors, this.error(segs, expected, failureData))}}`);
        }
        this.push("}");
        return;
      }
      case "lit":
        if (node.v !== null && typeof node.v === "object" && !(node.v instanceof Date) || typeof node.v === "function") {
          this.emitCollectDelegate(node, v, segs, errors);
        } else {
          this.push(`if(!(${this.predicate(node, v)})){${this.appendError(errors, this.error(segs, expectedOf(node), failureData))}}`);
        }
        return;
      case "intersection":
      case "sub":
        this.emitCollectDelegate(node, v, segs, errors);
        return;
      case "null":
      case "undefined":
      case "boolean":
      case "bigint":
      case "symbol":
      case "never":
      case "anyobject":
      case "instance":
        this.push(`if(!(${this.predicate(node, v)})){${this.appendError(errors, this.error(segs, expectedOf(node), failureData))}}`);
        return;
      default:
        this.emitCollectDelegate(node, v, segs, errors);
    }
  }
  emitTupleShape(node, v, segs, errors, brk, failureData) {
    this.push(`if(!Array.isArray(${v})){${this.appendError(errors, this.error(segs, "an array", failureData))}break ${brk};}`);
    const requiredPrefix = node.prefix.filter((item) => !item.opt && !item.hasDefault).length;
    const minimum = requiredPrefix + node.postfix.length;
    if (minimum > 0) {
      this.push(`if(${v}.length<${minimum}){${this.appendError(errors, this.error(segs, `an array of at least length ${minimum}`, failureData))}break ${brk};}`);
    }
    if (node.variadic === undefined) {
      const maximum = node.prefix.length + node.postfix.length;
      this.push(`if(${v}.length>${maximum}){${this.appendError(errors, this.error(segs, `an array of at most length ${maximum}`, failureData))}break ${brk};}`);
    }
    let postfixStart = `${v}.length`;
    if (node.postfix.length > 0) {
      postfixStart = this.next("p");
      this.push(`const ${postfixStart}=${v}.length-${node.postfix.length};`);
    }
    let prefixCount = String(node.prefix.length);
    if (requiredPrefix !== node.prefix.length) {
      prefixCount = this.next("n");
      this.push(`const ${prefixCount}=Math.min(${node.prefix.length},${postfixStart});`);
    }
    return { postfixStart, prefixCount, requiredPrefix };
  }
  emitDefaultFill(val, def, isFactory, target, segs, errors) {
    if (isFactory && typeof def === "function") {
      const candidate = this.next("d");
      const resolved = this.next("t");
      const label = this.next("L");
      this.push(`const ${candidate}=${this.ref(def)}();let ${resolved};${label}:{`);
      this.emitCollectProduce(val, candidate, segs, resolved, errors, label);
      this.push(`${target}=${resolved};}`);
    } else {
      this.push(`${target}=${litSource(def) ?? `MD(${this.ref(def)})`};`);
    }
  }
  emitCollectProduce(node, v, segs, out, errors, brk, failureData = v) {
    if (node.cfg !== undefined || node.k === "refine") {
      this.emitCollectDelegate(node, v, segs, errors, brk, out);
      return;
    }
    if (!hasMorph(node)) {
      this.emitCollectCheck(node, v, segs, errors, failureData);
      this.push(`${out}=${v};`);
      return;
    }
    switch (node.k) {
      case "sub":
        this.emitCollectDelegate(node, v, segs, errors, brk, out);
        return;
      case "morph": {
        const input = this.next("t");
        this.push(`let ${input};`);
        const mark = this.markErrors(errors);
        this.emitCollectProduce(node.input, v, segs, input, errors, brk, failureData);
        this.guardGrowth(errors, mark, brk);
        const context = this.next("c");
        const result = this.next("r");
        this.push(`const ${context}=new MC(${this.storedPathExpr(segs)},${input});`);
        this.push(`const ${result}=${this.ref(node.fn)}(${input},${context});`);
        this.push(`if(${result} instanceof AE){${this.appendError(errors, result)}break ${brk};}`);
        if (node.out === undefined)
          this.push(`${out}=${result};`);
        else
          this.emitCollectProduce(node.out, result, segs, out, errors, brk);
        return;
      }
      case "alias": {
        let active = this.#activeAliases;
        if (active === undefined) {
          active = new Set;
          this.#activeAliases = active;
        }
        if (active.has(node)) {
          this.emitCollectDelegate(node, v, segs, errors, brk, out);
          return;
        }
        active.add(node);
        try {
          this.emitCollectProduce(node.resolve(), v, segs, out, errors, brk, failureData);
        } finally {
          active.delete(node);
        }
        return;
      }
      case "union": {
        const ok = this.next("u");
        this.push(`let ${ok}=false;`);
        const label = this.next("b");
        this.push(`${label}:{`);
        for (const m of node.members) {
          if (m.k !== "sub" && !hasMorph(m)) {
            this.push(`if(${this.predicate(m, v)}){${out}=${v};${ok}=true;break ${label};}`);
          }
        }
        for (const m of node.members) {
          if (m.k === "sub" || hasMorph(m)) {
            const runner = m.k === "sub" ? m.schema.run : m.k === "alias" ? boundWalk(m) : compile(m);
            const r = this.next("r");
            this.push(`const ${r}=${this.ref(runner)}(${v});`);
            this.push(`if(!(${r} instanceof AE)){${out}=${r};${ok}=true;break ${label};}`);
          }
        }
        this.push("}");
        const failure = `UF(${this.ref(node)},${failureData},${this.pathExpr(segs)},${JSON.stringify(expectedOf(node))})`;
        this.push(`if(!${ok}){${this.appendError(errors, failure)}break ${brk};}`);
        return;
      }
      case "array": {
        this.push(`if(!Array.isArray(${v})){${this.appendError(errors, this.error(segs, "an array", failureData))}break ${brk};}`);
        if (node.min !== undefined) {
          this.push(`if(${v}.length<${node.min}){${this.appendError(errors, this.error(segs, `at least length ${node.min}`, `${v}.length`))}break ${brk};}`);
        }
        if (node.max !== undefined) {
          this.push(`if(${v}.length>${node.max}){${this.appendError(errors, this.error(segs, `at most length ${node.max}`, `${v}.length`))}break ${brk};}`);
        }
        const array = this.next("a");
        const index = this.next("i");
        const input = this.next("x");
        const element = this.next("t");
        const label = this.next("L");
        this.push(`const ${array}=new Array(${v}.length);`);
        this.push(`for(let ${index}=0;${index}<${v}.length;${index}++){const ${input}=${v}[${index}];let ${element};${label}:{`);
        this.emitCollectProduce(node.el, input, [...segs, { d: index }], element, errors, label);
        this.push(`${array}[${index}]=${element};}}`);
        this.push(`${out}=${array};`);
        return;
      }
      case "tuple": {
        const { postfixStart, prefixCount, requiredPrefix } = this.emitTupleShape(node, v, segs, errors, brk, failureData);
        const tuple = this.next("a");
        this.push(`const ${tuple}=[...${v}];`);
        for (let index = 0;index < node.prefix.length; index++) {
          const item = node.prefix[index];
          const itemSegs = [...segs, { s: index }];
          const input = `${v}[${index}]`;
          const output = `${tuple}[${index}]`;
          const label = this.next("L");
          if (index >= requiredPrefix)
            this.push(`if(${index}<${prefixCount}){`);
          this.push(`${label}:{`);
          if (hasMorph(item.val)) {
            const temporary = this.next("t");
            this.push(`let ${temporary};`);
            this.emitCollectProduce(item.val, input, itemSegs, temporary, errors, label);
            this.push(`${output}=${temporary};`);
          } else {
            this.emitCollectCheck(item.val, input, itemSegs, errors);
          }
          this.push("}");
          if (index >= requiredPrefix) {
            if (item.hasDefault) {
              this.push("}else{");
              this.emitDefaultFill(item.val, item.def, item.defFactory === true, output, itemSegs, errors);
              this.push("}");
            } else {
              this.push("}");
            }
          }
        }
        if (node.variadic !== undefined) {
          const index = this.next("i");
          const input = this.next("x");
          const label = this.next("L");
          this.push(`for(let ${index}=${prefixCount};${index}<${postfixStart};${index}++){const ${input}=${v}[${index}];${label}:{`);
          if (hasMorph(node.variadic)) {
            const temporary = this.next("t");
            this.push(`let ${temporary};`);
            this.emitCollectProduce(node.variadic, input, [...segs, { d: index }], temporary, errors, label);
            this.push(`${tuple}[${index}]=${temporary};`);
          } else {
            this.emitCollectCheck(node.variadic, input, [...segs, { d: index }], errors);
          }
          this.push("}}");
        }
        for (let index = 0;index < node.postfix.length; index++) {
          const inputIndex = index === 0 ? postfixStart : `${postfixStart}+${index}`;
          const input = `${v}[${inputIndex}]`;
          const item = node.postfix[index];
          const label = this.next("L");
          this.push(`${label}:{`);
          if (hasMorph(item)) {
            const temporary = this.next("t");
            this.push(`let ${temporary};`);
            this.emitCollectProduce(item, input, [...segs, { d: inputIndex }], temporary, errors, label);
            this.push(`${tuple}[${inputIndex}]=${temporary};`);
          } else {
            this.emitCollectCheck(item, input, [...segs, { d: inputIndex }], errors);
          }
          this.push("}");
        }
        this.push(`${out}=${tuple};`);
        return;
      }
      case "object": {
        if (node.patternIndexes !== undefined || node.symbolIndex !== undefined || node.props.some((prop) => typeof prop.key === "symbol")) {
          this.emitCollectDelegate(node, v, segs, errors, brk, out);
          return;
        }
        this.push(`if(typeof ${v}!=="object"||${v}===null){${this.appendError(errors, this.error(segs, "an object", failureData))}break ${brk};}`);
        const object = this.next("o");
        const fresh = node.extras === "delete" && node.index === undefined;
        this.push(fresh ? `const ${object}={};` : `const ${object}={...${v}};`);
        for (const prop of node.props) {
          const present = `${this.lit(prop.key)} in ${v}`;
          const propSegs = [...segs, { s: prop.key }];
          const input = this.access(v, prop.key);
          const output = this.access(object, prop.key);
          const label = this.next("L");
          this.push(`if(!(${present})){`);
          if (prop.hasDefault) {
            this.emitDefaultFill(prop.val, prop.def, prop.defFactory === true, output, propSegs, errors);
          } else if (!prop.opt) {
            this.push(this.appendError(errors, this.error(propSegs, expectedOf(prop.val), "M")));
          }
          this.push(`}else{${label}:{`);
          if (hasMorph(prop.val)) {
            const temporary = this.next("t");
            this.push(`let ${temporary};`);
            this.emitCollectProduce(prop.val, input, propSegs, temporary, errors, label);
            this.push(`${output}=${temporary};`);
          } else {
            this.emitCollectCheck(prop.val, input, propSegs, errors);
            if (fresh)
              this.push(`${output}=${input};`);
          }
          this.push("}}");
        }
        if (node.index !== undefined) {
          const key = this.next("k");
          const label = this.next("L");
          this.push(`for(const ${key} in ${v})if(own.call(${v},${key})){${label}:{`);
          if (hasMorph(node.index)) {
            const temporary = this.next("t");
            this.push(`let ${temporary};`);
            this.emitCollectProduce(node.index, `${v}[${key}]`, [...segs, { d: key }], temporary, errors, label);
            this.push(`${object}[${key}]=${temporary};`);
          } else {
            this.emitCollectCheck(node.index, `${v}[${key}]`, [...segs, { d: key }], errors);
          }
          this.push("}}");
        } else if (node.extras === "reject") {
          const key = this.next("k");
          this.push(`for(const ${key} in ${v})if(own.call(${v},${key})&&!(${this.declaredCheck(node.props, key)})){${this.appendError(errors, this.error([...segs, { d: key }], "removed", `${v}[${key}]`))}}`);
        }
        if (node.extras === "reject") {
          const symbol = this.next("s");
          this.push(`for(const ${symbol} of Object.getOwnPropertySymbols(${v}))if(Object.prototype.propertyIsEnumerable.call(${v},${symbol})&&!(${this.declaredCheck(node.props, symbol)})){${this.appendError(errors, this.error([...segs, { d: symbol }], "removed", `${v}[${symbol}]`))}}`);
        }
        this.push(`${out}=${object};`);
        return;
      }
      case "intersection": {
        const current = this.next("t");
        this.push(`let ${current}=${v};`);
        const mark = this.markErrors(errors);
        for (let index = 0;index < node.members.length; index++) {
          if (index > 0)
            this.guardGrowth(errors, mark, brk);
          const member = node.members[index];
          if (hasMorph(member))
            this.emitCollectProduce(member, current, segs, current, errors, brk);
          else
            this.emitCollectCheck(member, current, segs, errors);
        }
        this.push(`${out}=${current};`);
        return;
      }
      default:
        this.emitCollectDelegate(node, v, segs, errors, brk, out);
    }
  }
  build(ir) {
    const errors = this.next("e");
    let ret;
    if (hasMorph(ir)) {
      const label = this.next("L");
      this.push(`let ${errors};let o;${label}:{`);
      this.emitCollectProduce(ir, "v", [], "o", errors, label);
      this.push("}");
      ret = "o";
    } else {
      this.push(`let ${errors};`);
      this.emitCollectCheck(ir, "v", [], errors);
      ret = "v";
    }
    this.push(`if(${errors}!==undefined)return ${errors};`);
    const src = `return function(v){${this.#lines.join("")}return ${ret}}`;
    const make = new Function("R", "AE", "M", "PF", "UF", "MC", "own", "MD", src);
    return make(this.#refs, OmpErrors, MISSING, prefixErrors, unionFail, CompiledMorphContext, own2, materializeDefault);
  }
  emitAllows(node, v) {
    switch (node.k) {
      case "array": {
        const array = this.next("a");
        const index = this.next("i");
        this.push(`const ${array}=${v};if(!Array.isArray(${array}))return false;`);
        if (node.min !== undefined)
          this.push(`if(${array}.length<${node.min})return false;`);
        if (node.max !== undefined)
          this.push(`if(${array}.length>${node.max})return false;`);
        this.push(`for(let ${index}=0;${index}<${array}.length;${index}++){`);
        this.emitAllows(node.el, `${array}[${index}]`);
        this.push("}");
        return;
      }
      case "object": {
        const object = this.next("o");
        this.push(`const ${object}=${v};if(typeof ${object}!=="object"||${object}===null)return false;`);
        for (const prop of node.props) {
          const value = this.next("p");
          const present = `${this.lit(prop.key)} in ${object}`;
          this.push(`const ${value}=${this.access(object, prop.key)};`);
          if (prop.opt || prop.hasDefault) {
            if (rejectsUndefined(prop.val)) {
              this.push(`if(${value}!==undefined){`);
              this.emitAllows(prop.val, value);
              this.push(`}else if(${present})return false;`);
            } else {
              this.push(`if(${present}){`);
              this.emitAllows(prop.val, value);
              this.push("}");
            }
          } else {
            if (!rejectsUndefined(prop.val))
              this.push(`if(!(${present}))return false;`);
            this.emitAllows(prop.val, value);
          }
        }
        const stringKey = this.next("k");
        if (node.index !== undefined) {
          this.push(`for(const ${stringKey} in ${object}){if(!own.call(${object},${stringKey}))continue;`);
          this.emitAllows(node.index, `${object}[${stringKey}]`);
          this.push("}");
        }
        if (node.patternIndexes !== undefined) {
          for (const pattern of node.patternIndexes) {
            this.push(`for(const ${stringKey} in ${object})if(own.call(${object},${stringKey})&&(${this.predicate(pattern.key, stringKey)})&&!(${this.predicate(pattern.val, `${object}[${stringKey}]`)}))return false;`);
          }
        }
        if (node.symbolIndex !== undefined) {
          const symbol = this.next("s");
          this.push(`for(const ${symbol} of Object.getOwnPropertySymbols(${object})){if(!Object.prototype.propertyIsEnumerable.call(${object},${symbol}))continue;`);
          this.emitAllows(node.symbolIndex, `${object}[${symbol}]`);
          this.push("}");
        }
        if (node.extras === "reject") {
          const patternMatch = node.patternIndexes?.map((pattern) => `(${this.predicate(pattern.key, stringKey)})`).join("||") ?? "false";
          if (node.index === undefined) {
            this.push(`for(const ${stringKey} in ${object})if(own.call(${object},${stringKey})&&!(${this.declaredCheck(node.props, stringKey)})&&!(${patternMatch}))return false;`);
          }
          if (node.symbolIndex === undefined) {
            const symbol = this.next("s");
            this.push(`for(const ${symbol} of Object.getOwnPropertySymbols(${object}))if(Object.prototype.propertyIsEnumerable.call(${object},${symbol})&&!(${this.declaredCheck(node.props, symbol)}))return false;`);
          }
        }
        return;
      }
      case "union": {
        const sources = [];
        for (const member of node.members) {
          if (!isPrimitiveLiteral(member))
            break;
          const source = litSource(member.v);
          if (source === undefined)
            break;
          sources.push(source);
        }
        if (sources.length === node.members.length && sources.length >= 4) {
          this.push(`switch(${v}){${sources.map((source) => `case ${source}:`).join("")}break;default:return false;}`);
          return;
        }
        this.push(`if(!(${this.predicate(node, v)}))return false;`);
        return;
      }
      default:
        this.push(`if(!(${this.predicate(node, v)}))return false;`);
    }
  }
  buildAllows(ir) {
    this.emitAllows(ir, "v");
    const src = `return function(v){${this.#lines.join("")}return true}`;
    const make = new Function("R", "AE", "own", src);
    return make(this.#refs, OmpErrors, own2);
  }
}
function prefixErrors(errs, parts) {
  for (let i = parts.length - 1;i >= 0; i--)
    errs.prefix(parts[i]);
  return errs;
}
var kWalk = Symbol("omptype.boundWalk");
function boundWalk(node) {
  const tagged = node;
  let fn = tagged[kWalk];
  if (!fn) {
    fn = (value, path) => walk(node, value, path);
    tagged[kWalk] = fn;
  }
  return fn;
}
function resolvedRoot(ir) {
  return ir.k === "alias" ? ir.resolve() : ir;
}
var jitBlocked = false;
function tryBuild(build) {
  if (jitBlocked)
    return;
  try {
    return build();
  } catch (error) {
    if (!(error instanceof EvalError))
      throw error;
    jitBlocked = true;
    return;
  }
}
var compiledCache = new WeakMap;
var allowsCache = new WeakMap;
function compile(ir) {
  const root = resolvedRoot(ir);
  const validator = compiledCache.get(root);
  if (validator === undefined) {
    const built = {};
    const deferred = (value) => built.value === undefined ? walk(root, value) : built.value(value);
    compiledCache.set(root, deferred);
    const compiled = tryBuild(() => new Builder().build(root)) ?? ((value) => walk(root, value));
    built.value = compiled;
    compiledCache.set(root, compiled);
    return compiled;
  }
  return validator;
}
function compileAllows(ir) {
  const root = resolvedRoot(ir);
  const validator = allowsCache.get(root);
  if (validator === undefined) {
    const built = {};
    allowsCache.set(root, (value) => built.value === undefined ? !(walk(root, value) instanceof OmpErrors) : built.value(value));
    const compiled = tryBuild(() => new Builder().buildAllows(root)) ?? ((value) => !(walk(root, value) instanceof OmpErrors));
    built.value = compiled;
    allowsCache.set(root, compiled);
    return compiled;
  }
  return validator;
}

// node_modules/@oh-my-pi/omptype/src/json-schema.ts
function irToJsonSchema(ir, options) {
  const ctx = { options, defs: new Map, refs: new Map };
  let schema = emit(ir, ctx);
  if (ctx.defs.size > 0)
    schema.$defs = Object.fromEntries(ctx.defs);
  if (options?.target === "draft-07")
    schema = toDraft7(schema);
  const dialect = options?.dialect === null ? undefined : options?.dialect ?? dialectFor(options?.target);
  if (dialect !== undefined)
    schema.$schema = dialect;
  if (options?.description !== undefined)
    schema.description = options.description;
  return schema;
}
function dialectFor(target) {
  if (target === "draft-2020-12")
    return "https://json-schema.org/draft/2020-12/schema";
  if (target === "draft-07")
    return "http://json-schema.org/draft-07/schema#";
  return target !== undefined && (target.startsWith("http://") || target.startsWith("https://")) ? target : undefined;
}
function fallback(schema, ctx) {
  const replacement = ctx.options?.fallback?.({ base: schema });
  if (replacement === true)
    return {};
  if (replacement === false)
    return { not: {} };
  return typeof replacement === "object" && replacement !== null ? replacement : schema;
}
function toDraft7(schema) {
  const converted = {};
  for (const key in schema) {
    const value = schema[key];
    if (key === "$ref" && typeof value === "string") {
      converted.$ref = value.replace("#/$defs/", "#/definitions/");
    } else if (key === "$defs") {
      converted.definitions = toDraft7(value);
    } else if (key === "prefixItems" && Array.isArray(value)) {
      converted.items = value.map((item) => typeof item === "object" && item !== null ? toDraft7(item) : item);
    } else if (key === "items" && "prefixItems" in schema) {
      converted.additionalItems = typeof value === "object" && value !== null ? toDraft7(value) : value;
    } else if (Array.isArray(value)) {
      converted[key] = value.map((item) => typeof item === "object" && item !== null ? toDraft7(item) : item);
    } else if (typeof value === "object" && value !== null) {
      converted[key] = toDraft7(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}
function emit(ir, ctx) {
  let schema;
  switch (ir.k) {
    case "unknown":
      schema = {};
      break;
    case "undefined":
      schema = fallback({}, ctx);
      break;
    case "null":
      schema = { type: "null" };
      break;
    case "boolean":
      schema = { type: "boolean" };
      break;
    case "bigint":
      schema = { type: "integer" };
      break;
    case "symbol":
      schema = fallback({}, ctx);
      break;
    case "never":
      schema = { not: {} };
      break;
    case "anyobject":
      schema = { type: "object" };
      break;
    case "string":
      schema = emitString(ir);
      break;
    case "number":
      schema = emitNumber(ir);
      break;
    case "lit":
      schema = emitLiteral(ir.v);
      break;
    case "union":
      schema = emitUnion(ir.members, ctx);
      break;
    case "intersection":
      schema = { allOf: ir.members.map((member) => emit(member, ctx)) };
      break;
    case "array":
      schema = { type: "array", items: emit(ir.el, ctx) };
      if (ir.min !== undefined)
        schema.minItems = ir.min;
      if (ir.max !== undefined)
        schema.maxItems = ir.max;
      break;
    case "tuple": {
      const prefixItems = ir.prefix.map((item) => {
        const itemSchema = emit(item.val, ctx);
        if (item.hasDefault) {
          itemSchema.default = item.defFactory && typeof item.def === "function" ? item.def() : item.def;
        }
        return itemSchema;
      });
      const required = ir.prefix.reduce((count, item) => count + (item.opt || item.hasDefault ? 0 : 1), ir.postfix.length);
      schema = { type: "array", prefixItems, minItems: required };
      if (ir.variadic === undefined) {
        schema.items = false;
      } else {
        schema.items = emit(ir.variadic, ctx);
      }
      break;
    }
    case "object":
      schema = emitObject(ir.props, ir.index, ir.extras, ctx);
      break;
    case "instance":
      schema = ir.ctor === Date ? { type: "string", format: "date-time" } : fallback({ type: "object" }, ctx);
      break;
    case "refine":
      schema = emit(ir.base, ctx);
      if (ir.json !== undefined)
        Object.assign(schema, ir.json);
      break;
    case "morph":
      schema = ctx.options?.io === "input" ? emit(ir.input, ctx) : fallback(emit(ir.out ?? ir.input, ctx), ctx);
      break;
    case "alias": {
      const known = ctx.refs.get(ir.resolve);
      if (known !== undefined) {
        schema = { $ref: `#/$defs/${known}` };
        break;
      }
      let name = ir.name.replace(/[^\w.-]/g, "_");
      while ([...ctx.refs.values()].includes(name))
        name = `${name}_`;
      ctx.refs.set(ir.resolve, name);
      ctx.defs.set(name, emit(ir.resolve(), ctx));
      schema = { $ref: `#/$defs/${name}` };
      break;
    }
    case "sub":
      if (ctx.options?.io === "output" && ir.schema.opaqueOutput) {
        schema = {};
      } else if (ctx.options?.io === "output" && ir.schema.stepOut !== undefined) {
        schema = emit(ir.schema.stepOut, ctx);
      } else if (ctx.options?.io === "input") {
        schema = emit(ir.schema.ir, ctx);
      } else {
        schema = ir.schema.hasSteps ? fallback(emit(ir.schema.ir, ctx), ctx) : emit(ir.schema.ir, ctx);
      }
      if (ir.schema.ir.desc !== undefined)
        schema.description = ir.schema.ir.desc;
      else if (ir.schema.description !== undefined && ir.descAuto !== true) {
        schema.description = ir.schema.description;
      }
      break;
  }
  if (ir.desc !== undefined && ir.descAuto !== true)
    schema.description = ir.desc;
  return schema;
}
function emitString(ir) {
  const schema = { type: "string" };
  if (ir.min !== undefined)
    schema.minLength = ir.min;
  if (ir.max !== undefined)
    schema.maxLength = ir.max;
  if (ir.url)
    schema.format = "uri";
  return schema;
}
function emitNumber(ir) {
  const schema = { type: ir.int ? "integer" : "number" };
  if (ir.min !== undefined)
    schema[ir.xmin ? "exclusiveMinimum" : "minimum"] = ir.min;
  if (ir.max !== undefined)
    schema[ir.xmax ? "exclusiveMaximum" : "maximum"] = ir.max;
  if (ir.divisor !== undefined)
    schema.multipleOf = ir.divisor;
  return schema;
}
function emitLiteral(value) {
  if (value instanceof Date)
    return { type: "string", format: "date-time", const: value.toISOString() };
  if (isJsonValue(value))
    return { const: value };
  switch (typeof value) {
    case "string":
      return { type: "string" };
    case "number":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "bigint":
      return { type: "integer" };
    case "object":
      return { type: "object" };
    default:
      return {};
  }
}
function emitUnion(members, ctx) {
  const defined = members.filter((member) => member.k !== "undefined");
  if (defined.length === 0)
    return {};
  if (defined.length === 1)
    return emit(defined[0], ctx);
  if (defined.every((member) => member.k === "lit" && isJsonValue(member.v))) {
    const values = defined.map((member) => member.v);
    const schema = { enum: values };
    const scalarType = homogeneousScalarType(values);
    if (scalarType !== undefined)
      schema.type = scalarType;
    return schema;
  }
  return { anyOf: defined.map((member) => emit(member, ctx)) };
}
function homogeneousScalarType(values) {
  const first = jsonScalarType(values[0]);
  if (first === undefined)
    return;
  for (let i = 1;i < values.length; i++) {
    if (jsonScalarType(values[i]) !== first)
      return;
  }
  return first;
}
function jsonScalarType(value) {
  if (value === null)
    return "null";
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return typeof value;
    default:
      return;
  }
}
function emitObject(props, index, extras, ctx) {
  const properties = {};
  const required = [];
  const filled = (prop) => !prop.opt && (ctx.options?.io === "output" || !prop.hasDefault);
  const ordered = [...props.filter(filled), ...props.filter((prop) => !filled(prop))];
  for (const prop of ordered) {
    if (typeof prop.key === "symbol")
      throw new TypeError("Cannot convert a symbol to a string");
    const key = String(prop.key);
    const propertySchema = emit(prop.val, ctx);
    if (prop.hasDefault) {
      propertySchema.default = prop.defFactory ? prop.def() : prop.def;
    }
    properties[key] = propertySchema;
    if (filled(prop))
      required.push(key);
  }
  const schema = { type: "object", properties };
  if (required.length > 0)
    schema.required = required;
  if (index !== undefined)
    schema.additionalProperties = emit(index, ctx);
  else if (extras === "reject")
    schema.additionalProperties = false;
  return schema;
}
function isJsonValue(value, seen = new Set) {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return true;
  if (typeof value === "number")
    return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value))
    return false;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!isJsonValue(item, seen))
        return false;
    }
    seen.delete(value);
    return true;
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null)
    return false;
  for (const key in value) {
    if (Object.hasOwn(value, key) && !isJsonValue(value[key], seen))
      return false;
  }
  seen.delete(value);
  return true;
}

// node_modules/@oh-my-pi/omptype/src/type.ts
useAssignability(isSubtype);
var Type = Object.defineProperty(function Type() {}, Symbol.hasInstance, {
  value: (value) => (typeof value === "function" || typeof value === "object" && value !== null) && (IR_BRAND in value)
});
function descriptionOf(ir, seen = new Set) {
  if (ir.desc !== undefined)
    return ir.desc;
  if (seen.has(ir))
    return ir.k === "alias" ? ir.name : expectedOf(ir);
  seen.add(ir);
  if (ir.k === "alias")
    return descriptionOf(ir.resolve(), seen);
  if (ir.k === "object") {
    return `{ ${ir.props.map((prop) => `${String(prop.key)}${prop.opt ? "?" : ""}: ${descriptionOf(prop.val, seen)}`).join(", ")} }`;
  }
  return expectedOf(ir);
}
function errorConfigOf(config) {
  return {
    ...config.description === undefined || config.expected !== undefined ? {} : { expected: config.description },
    ...config.expected === undefined ? {} : { expected: config.expected },
    ...config.actual === undefined ? {} : { actual: config.actual },
    ...config.problem === undefined ? {} : { problem: config.problem },
    ...config.message === undefined ? {} : { message: config.message }
  };
}
function configureNode(ir, config) {
  return {
    ...ir,
    cfg: { ...ir.cfg, ...errorConfigOf(config) },
    ...config.description === undefined ? {} : { desc: config.description }
  };
}
function configureSelected(ir, config, selector) {
  const domain = ir.k === "string" || ir.k === "number" || ir.k === "boolean" || ir.k === "bigint" || ir.k === "symbol" ? ir.k : ir.k === "object" || ir.k === "array" || ir.k === "tuple" || ir.k === "instance" || ir.k === "anyobject" ? "object" : undefined;
  const kind = ir.k === "number" && ir.divisor !== undefined ? "divisor" : "domain";
  if ((selector.kind === undefined || selector.kind === kind) && (selector.where === undefined || selector.where({ kind, domain }))) {
    return configureNode(ir, config);
  }
  switch (ir.k) {
    case "array":
      return { ...ir, el: configureSelected(ir.el, config, selector) };
    case "tuple":
      return {
        ...ir,
        prefix: ir.prefix.map((item) => ({ ...item, val: configureSelected(item.val, config, selector) })),
        ...ir.variadic === undefined ? {} : { variadic: configureSelected(ir.variadic, config, selector) },
        postfix: ir.postfix.map((item) => configureSelected(item, config, selector))
      };
    case "object":
      return {
        ...ir,
        props: ir.props.map((prop) => ({ ...prop, val: configureSelected(prop.val, config, selector) })),
        ...ir.index === undefined ? {} : { index: configureSelected(ir.index, config, selector) },
        symbolIndex: ir.symbolIndex === undefined ? undefined : configureSelected(ir.symbolIndex, config, selector),
        patternIndexes: ir.patternIndexes?.map((index) => ({
          key: configureSelected(index.key, config, selector),
          val: configureSelected(index.val, config, selector)
        }))
      };
    case "union":
    case "intersection":
      return { ...ir, members: ir.members.map((member) => configureSelected(member, config, selector)) };
    case "refine":
      return { ...ir, base: configureSelected(ir.base, config, selector) };
    case "morph":
      return {
        ...ir,
        input: configureSelected(ir.input, config, selector),
        ...ir.out === undefined ? {} : { out: configureSelected(ir.out, config, selector) }
      };
    default:
      return ir;
  }
}

class Ctx {
  expectation;
  errors;
  path;
  #data;
  constructor(data, path = []) {
    this.#data = data;
    this.path = path.map((key) => typeof key === "symbol" ? String(key) : key);
  }
  error(input) {
    const detail = typeof input === "string" ? { expected: input } : input;
    const error = OmpErrors.single([...detail.path ?? detail.relativePath ?? []], detail.expected, this.#data, {
      preserveActual: true,
      ...Object.hasOwn(detail, "actual") ? { actual: String(detail.actual) } : {}
    });
    if (this.errors)
      this.errors.append(error);
    else
      this.errors = error;
    return error;
  }
  mustBe(expectation) {
    this.expectation = expectation;
    return false;
  }
  reject(input) {
    if (typeof input === "string") {
      this.expectation = input;
      return false;
    }
    this.error(input);
    return false;
  }
}
var kBase = Symbol("omptype.base");
var kSteps = Symbol("omptype.steps");
var EMPTY_STEPS = [];
var EMPTY_META = {};
var ARK_COMPAT_SCOPE = Object.freeze({ internal: Object.freeze({ name: "ark" }) });
var JIT_THRESHOLD = 3;
function metaOf(schema) {
  return {
    description: schema.description,
    defaultValue: schema.defaultValue,
    hasDefault: schema.hasDefault,
    defaultOutput: schema.defaultOutput,
    hasDefaultOutput: schema.hasDefaultOutput,
    errorConfig: schema.errorConfig,
    clone: schema.clone
  };
}
function inheritScope(source, target) {
  if (source.resolver === undefined)
    return target;
  target.resolver = source.resolver;
  Reflect.set(target, "$", source.$);
  return target;
}
function invalidDefault(label, errors) {
  const error = errors[0];
  let heading = label;
  for (let index = 0;index < error.path.length; index++) {
    const segment = error.path[index];
    if (typeof segment === "number") {
      if (label === "Default" && index === 0)
        heading = "Default value";
      heading += ` at [${segment}]`;
    } else if (label === "Default" && index === 0) {
      heading += ` ${String(segment)}`;
    } else {
      heading += `.${String(segment)}`;
    }
  }
  throw new OmpTypeError(`ParseError: ${heading} ${error.problem}`);
}
function rejectMutableStaticDefault(value) {
  if (value !== null && typeof value === "object" && !(value instanceof Date)) {
    throw new OmpTypeError("ParseError: A mutable default value must be specified as a factory");
  }
}
function normalizeDefaults(ir, seen = new WeakSet) {
  if (seen.has(ir))
    return;
  seen.add(ir);
  switch (ir.k) {
    case "object":
      for (const prop of ir.props) {
        normalizeDefaults(prop.val, seen);
        if (!prop.hasDefault || prop.defValidated)
          continue;
        let candidate;
        let factory = false;
        if (prop.defFactory && typeof prop.def === "function") {
          candidate = prop.def();
          factory = true;
        } else {
          rejectMutableStaticDefault(prop.def);
          candidate = prop.def;
        }
        const output = walk(prop.val, candidate);
        if (output instanceof OmpErrors)
          invalidDefault(`Default for ${String(prop.key)}`, output);
        if (!factory)
          prop.def = output;
        prop.defValidated = true;
      }
      if (ir.index)
        normalizeDefaults(ir.index, seen);
      if (ir.symbolIndex)
        normalizeDefaults(ir.symbolIndex, seen);
      if (ir.patternIndexes) {
        for (const index of ir.patternIndexes) {
          normalizeDefaults(index.key, seen);
          normalizeDefaults(index.val, seen);
        }
      }
      return;
    case "tuple":
      for (let index = 0;index < ir.prefix.length; index++) {
        const item = ir.prefix[index];
        normalizeDefaults(item.val, seen);
        if (!item.hasDefault || item.defValidated)
          continue;
        let candidate;
        let factory = false;
        if (item.defFactory && typeof item.def === "function") {
          candidate = item.def();
          factory = true;
        } else {
          rejectMutableStaticDefault(item.def);
          candidate = item.def;
        }
        const output = walk(item.val, candidate);
        if (output instanceof OmpErrors)
          invalidDefault(`Default for [${index}]`, output);
        if (!factory)
          item.def = output;
        item.defValidated = true;
      }
      if (ir.variadic)
        normalizeDefaults(ir.variadic, seen);
      for (const item of ir.postfix)
        normalizeDefaults(item, seen);
      return;
    case "array":
      normalizeDefaults(ir.el, seen);
      return;
    case "union":
    case "intersection":
      for (const member of ir.members)
        normalizeDefaults(member, seen);
      return;
    case "refine":
      normalizeDefaults(ir.base, seen);
      return;
    case "morph":
      normalizeDefaults(ir.input, seen);
      if (ir.out)
        normalizeDefaults(ir.out, seen);
      return;
    default:
      return;
  }
}
var OPAQUE_OUTPUT_IR = { k: "unknown" };
var typeMethods = {
  describe(description) {
    const ir = { ...this.ir, desc: description, cfg: { ...this.ir.cfg, expected: description } };
    return makeType(ir, this[kSteps], { ...metaOf(this), description });
  },
  configure(config, selector = "self") {
    const selected = selector === "self" ? configureNode(this.ir, config) : configureSelected(this.ir, config, selector);
    return makeType(selected, this[kSteps], {
      ...metaOf(this),
      errorConfig: { ...this.errorConfig, ...errorConfigOf(config) },
      ...config.description === undefined ? {} : { description: config.description }
    });
  },
  default(value) {
    const factory = typeof value === "function";
    if (!factory)
      rejectMutableStaticDefault(value);
    const candidate = factory ? value() : value;
    const output = this.run(candidate);
    if (output instanceof OmpErrors)
      invalidDefault("Default", output);
    return makeType(this.ir, this[kSteps], {
      ...metaOf(this),
      defaultValue: value,
      hasDefault: true,
      ...factory ? {} : { defaultOutput: output, hasDefaultOutput: true }
    });
  },
  optional() {
    return [this, "?"];
  },
  or(def) {
    const other = parseDef(def, this.resolver);
    const a = embed(this);
    const members = [...a.k === "union" ? a.members : [a], ...other.k === "union" ? other.members : [other]];
    return inheritScope(this, makeType({ k: "union", members }, [], {}));
  },
  equals(def) {
    return irEquals(embed(this), parseDef(def, this.resolver));
  },
  ifEquals(def) {
    return irEquals(embed(this), parseDef(def, this.resolver)) ? this : undefined;
  },
  ifExtends(def) {
    return isSubtype(embed(this), parseDef(def, this.resolver)) ? this : undefined;
  },
  extends(def) {
    return isSubtype(embed(this), parseDef(def, this.resolver));
  },
  overlaps(def) {
    try {
      intersect(embed(this), parseDef(def, this.resolver));
      return true;
    } catch (error) {
      if (error instanceof OmpTypeError)
        return false;
      throw error;
    }
  },
  distribute(mapper, reducer) {
    const branches = this.ir.k === "union" ? this.ir.members : [embed(this)];
    const mapped = branches.map((branch) => mapper(makeType(branch, [], {})));
    if (reducer !== undefined)
      return reducer(mapped);
    const members = mapped.map((branch) => embed(branch));
    return makeType(members.length === 1 ? members[0] : { k: "union", members }, [], {});
  },
  select(kind) {
    return selectNodes(this.ir, kind);
  },
  and(def) {
    return inheritScope(this, makeType(intersect(embed(this), parseDef(def, this.resolver)), [], {}));
  },
  array() {
    return inheritScope(this, makeType({ k: "array", el: embed(this) }, [], {}));
  },
  atLeastLength(bound) {
    return makeType(withLengthBound(this.ir, "min", bound), this[kSteps], metaOf(this));
  },
  atMostLength(bound) {
    return makeType(withLengthBound(this.ir, "max", bound), this[kSteps], metaOf(this));
  },
  moreThanLength(bound) {
    return makeType(withLengthBound(this.ir, "min", bound + 1), this[kSteps], metaOf(this));
  },
  lessThanLength(bound) {
    return makeType(withLengthBound(this.ir, "max", bound - 1), this[kSteps], metaOf(this));
  },
  exactlyLength(bound) {
    const bounded = withLengthBound(withLengthBound(this.ir, "min", bound), "max", bound);
    return makeType(bounded, this[kSteps], metaOf(this));
  },
  atLeast(bound) {
    return makeType(withNumericBound(this.ir, "min", bound), this[kSteps], metaOf(this));
  },
  atMost(bound) {
    return makeType(withNumericBound(this.ir, "max", bound), this[kSteps], metaOf(this));
  },
  moreThan(bound) {
    return makeType(withNumericBound(this.ir, "min", bound, true), this[kSteps], metaOf(this));
  },
  lessThan(bound) {
    return makeType(withNumericBound(this.ir, "max", bound, true), this[kSteps], metaOf(this));
  },
  divisibleBy(divisor) {
    if (this.ir.k !== "number")
      throw new OmpTypeError(`cannot apply divisibility to ${this.ir.k}`);
    if (!Number.isFinite(divisor) || divisor === 0)
      throw new OmpTypeError("divisor must be non-zero");
    return makeType({ ...this.ir, divisor }, this[kSteps], metaOf(this));
  },
  positive() {
    return makeType(withNumericBound(this.ir, "min", 0, true), this[kSteps], metaOf(this));
  },
  negative() {
    return makeType(withNumericBound(this.ir, "max", 0, true), this[kSteps], metaOf(this));
  },
  nonNegative() {
    return makeType(withNumericBound(this.ir, "min", 0), this[kSteps], metaOf(this));
  },
  nonPositive() {
    return makeType(withNumericBound(this.ir, "max", 0), this[kSteps], metaOf(this));
  },
  matching(pattern) {
    return makeType(intersect(this.ir, patternIR(pattern)), this[kSteps], metaOf(this));
  },
  atOrAfter(bound) {
    const timestamp = bound instanceof Date ? bound.valueOf() : bound;
    return dateRefinement(this, timestamp, "at or after", (value) => value >= timestamp);
  },
  atOrBefore(bound) {
    const timestamp = bound instanceof Date ? bound.valueOf() : bound;
    return dateRefinement(this, timestamp, "at or before", (value) => value <= timestamp);
  },
  laterThan(bound) {
    const timestamp = bound instanceof Date ? bound.valueOf() : bound;
    return dateRefinement(this, timestamp, "later than", (value) => value > timestamp);
  },
  earlierThan(bound) {
    const timestamp = bound instanceof Date ? bound.valueOf() : bound;
    return dateRefinement(this, timestamp, "earlier than", (value) => value < timestamp);
  },
  pipe(...pipes) {
    return appendPipes(this, pipes, false);
  },
  to(def) {
    return appendPipes(this, [makeType(parseDef(def, this.resolver), [], {})], false, true);
  },
  filter(fn) {
    return makeType(this.ir, [{ kind: "filter", fn }, ...this[kSteps]], metaOf(this));
  },
  narrow(fn) {
    return makeType(this.ir, [...this[kSteps], { kind: "narrow", fn }], metaOf(this));
  },
  brand() {
    return this;
  },
  as() {
    return this;
  },
  readonly() {
    return this;
  },
  keyof() {
    return makeType(keyOf(this.ir), [], {});
  },
  get(...path) {
    if (path.length === 0)
      return this;
    let result = this.ir;
    for (const key of path)
      result = getPathIR(result, key);
    return makeType(result, [], {});
  },
  pick(...keys) {
    return makeType(selectObjectProps(this.ir, keys, true, "pick"), [], {});
  },
  omit(...keys) {
    return makeType(selectObjectProps(this.ir, keys, false, "omit"), [], {});
  },
  partial() {
    return makeType(setObjectOptionality(this.ir, true, "partial"), [], {});
  },
  required() {
    return makeType(setObjectOptionality(this.ir, false, "required"), [], {});
  },
  map(mapper) {
    const object = requireObject(this.ir, "map");
    const props = object.props.flatMap((prop) => {
      const original = propertyFromIR(prop);
      const mapped = mapper(original);
      return (Array.isArray(mapped) ? mapped : [mapped]).map((property) => propertyToIR(property.kind === "required" || property.kind === "optional" ? property : { ...property, kind: original.kind }));
    });
    return makeType({ ...object, props }, [], {});
  },
  merge(def) {
    const merged = mergeObjectDefinition(this.ir, def, this.resolver);
    return inheritScope(this, makeType(merged, [], {}));
  },
  extract(def) {
    return inheritScope(this, makeType(distributeFilter(this.ir, parseDef(def, this.resolver), true), [], {}));
  },
  exclude(def) {
    return inheritScope(this, makeType(distributeFilter(this.ir, parseDef(def, this.resolver), false), [], {}));
  },
  onUndeclaredKey(behavior) {
    const extras = behavior === "ignore" ? "keep" : behavior;
    const ir = withShallowExtras(this.ir, extras);
    if (extras === "delete" && ir.k === "union") {
      const objects = ir.members.filter((member) => member.k === "object");
      for (let left = 0;left < objects.length; left++) {
        for (let right = left + 1;right < objects.length; right++) {
          const sharedRequired = objects[left].props.some((leftProp) => !leftProp.opt && objects[right].props.some((rightProp) => !rightProp.opt && rightProp.key === leftProp.key));
          if (!sharedRequired) {
            const leftExpression = expressionOf(objects[left]).replace(/ }$/, ", + (undeclared): delete }");
            const rightExpression = expressionOf(objects[right]).replace(/ }$/, ", + (undeclared): delete }");
            throw new OmpTypeError(`ParseError: An unordered union of a type including a morph and a type with overlapping input is indeterminate:
Left: ${leftExpression}
Right: ${rightExpression}`);
          }
        }
      }
    }
    return makeType(ir, this[kSteps], metaOf(this));
  },
  onDeepUndeclaredKey(behavior) {
    return makeType(withDeepExtras(this.ir, behavior === "ignore" ? "keep" : behavior), this[kSteps], metaOf(this));
  },
  allows(data) {
    const steps = this[kSteps];
    let needsPredicates = false;
    for (const step of steps) {
      if (step.kind !== "pipe") {
        needsPredicates = true;
        break;
      }
    }
    if (!needsPredicates) {
      const allows = compileAllows(this.ir);
      this.allows = allows;
      return allows(data);
    }
    for (const step of steps) {
      if (step.kind === "filter" && !step.fn(data, new Ctx(data)))
        return false;
    }
    const out = this[kBase](data);
    if (out instanceof OmpErrors)
      return false;
    for (const step of steps) {
      if (step.kind === "narrow" && !step.fn(out, new Ctx(out)))
        return false;
    }
    return true;
  },
  assert(data) {
    const out = this.run(data);
    if (out instanceof OmpErrors)
      throw new TraversalError(out);
    return out;
  },
  from(data) {
    const out = this.run(data);
    if (out instanceof OmpErrors)
      throw new TraversalError(out);
    return out;
  },
  toJsonSchema(options) {
    const ir = options?.io === "output" ? this.opaqueOutput ? OPAQUE_OUTPUT_IR : this.stepOut ?? this.ir : this.ir;
    const description = options?.description ?? this.ir.desc;
    if (description === undefined)
      return irToJsonSchema(ir, options);
    return irToJsonSchema(ir, { ...options, description });
  }
};
Object.defineProperty(typeMethods, "expression", {
  get() {
    const input = expressionOf(this.ir);
    if (!this.hasSteps)
      return input;
    if (this.opaqueOutput)
      return `(In: ${input}) => Out<unknown>`;
    return `(In: ${input}) => To<${expressionOf(this.stepOut ?? this.ir)}>`;
  }
});
Object.defineProperty(typeMethods, "json", {
  get() {
    return arkJsonOf(this.ir);
  }
});
Object.defineProperty(typeMethods, "props", {
  get() {
    const object = requireObject(this.ir, "props");
    return object.props.map((prop) => propertyFromIR(prop));
  }
});
Object.defineProperty(typeMethods, "~standard", {
  get() {
    const jsonSchema = (io, options) => {
      if (options.target !== "draft-2020-12" && options.target !== "draft-07") {
        throw new OmpTypeError(`JSONSchema target '${options.target}' is not supported (must be "draft-2020-12" or "draft-07")`);
      }
      return this.toJsonSchema({ ...options.libraryOptions, target: options.target, io });
    };
    return {
      version: 1,
      vendor: "omptype",
      validate: (value) => {
        const out = this.run(value);
        return out instanceof OmpErrors ? { issues: out } : { value: out };
      },
      jsonSchema: {
        input: (options) => jsonSchema("input", options),
        output: (options) => jsonSchema("output", options)
      }
    };
  }
});
Object.defineProperty(typeMethods, "in", {
  get() {
    return makeType(projectIO(this.ir, "in"), [], {});
  }
});
Object.defineProperty(typeMethods, "out", {
  get() {
    if (this.opaqueOutput)
      return makeType({ k: "unknown" }, [], {});
    return makeType(projectIO(this.stepOut ?? this.ir, "out"), [], {});
  }
});
var allowsMethod = typeMethods.allows;
var assertMethod = typeMethods.assert;
var fromMethod = typeMethods.from;
Object.defineProperties(typeMethods, {
  description: {
    get() {
      return descriptionOf(this.ir);
    }
  },
  allows: {
    get() {
      const allows = (data) => allowsMethod.call(this, data);
      Object.defineProperty(this, "allows", { value: allows, writable: true });
      return allows;
    }
  },
  assert: {
    get() {
      const assert = assertMethod.bind(this);
      Object.defineProperty(this, "assert", { value: assert });
      return assert;
    }
  },
  from: {
    get() {
      const from = fromMethod.bind(this);
      Object.defineProperty(this, "from", { value: from });
      return from;
    }
  },
  pipe: {
    get() {
      const pipe = Object.assign((...pipes) => appendPipes(this, pipes, false), {
        try: (...pipes) => appendPipes(this, pipes, true)
      });
      Object.defineProperty(this, "pipe", { value: pipe });
      return pipe;
    }
  }
});
Object.setPrototypeOf(typeMethods, Function.prototype);
Object.defineProperty(typeMethods, "bind", { value: undefined });
function makeType(ir, steps, meta) {
  let morph = false;
  if (!isSimpleIR(ir)) {
    ir = normalizeIR(ir);
    morph = hasMorph(ir);
    if (morph) {
      normalizeDefaults(ir);
      assertDeterminateMorphUnions(ir);
    }
  }
  let calls = 0;
  let impl = (data) => {
    if (++calls >= JIT_THRESHOLD) {
      impl = compile(ir);
      return impl(data);
    }
    return walk(ir, data);
  };
  const base = (data) => impl(data);
  const errorConfig = meta.errorConfig ?? ir.cfg;
  const filterInput = steps.some((step) => step.kind === "filter") ? projectIO(ir, "in") : undefined;
  const validate = steps.length === 0 ? base : (data, contextPath = []) => {
    if (filterInput !== undefined) {
      const inputResult = walk(filterInput, data);
      if (inputResult instanceof OmpErrors)
        return inputResult;
    }
    for (const step of steps) {
      if (step.kind !== "filter")
        continue;
      const ctx = new Ctx(data, contextPath);
      const result = step.fn(data, ctx);
      if (result instanceof OmpErrors)
        return errorConfig === undefined ? result : result.configure(errorConfig);
      if (ctx.errors)
        return errorConfig === undefined ? ctx.errors : ctx.errors.configure(errorConfig);
      if (!result) {
        return OmpErrors.single([], ctx.expectation ?? (step.fn.name ? `valid according to ${step.fn.name}` : "valid (input predicate failed)"), data, errorConfig);
      }
    }
    let out = base(data);
    if (out instanceof OmpErrors)
      return out;
    for (const step of steps) {
      if (step.kind === "filter")
        continue;
      const ctx = new Ctx(out, contextPath);
      if (step.kind === "narrow") {
        const result = step.fn(out, ctx);
        if (result instanceof OmpErrors) {
          return errorConfig === undefined ? result : result.configure(errorConfig);
        }
        if (ctx.errors)
          return errorConfig === undefined ? ctx.errors : ctx.errors.configure(errorConfig);
        if (!result) {
          return OmpErrors.single([], ctx.expectation ?? (step.fn.name ? `valid according to ${step.fn.name}` : "valid (narrow predicate failed)"), out, errorConfig);
        }
      } else {
        try {
          out = step.fn(out, ctx);
        } catch (error) {
          if (!step.try)
            throw error;
          const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          return OmpErrors.single([], `valid (morph threw ${detail})`, out, errorConfig);
        }
        if (out instanceof OmpErrors) {
          return errorConfig === undefined ? out : out.configure(errorConfig);
        }
      }
    }
    return out;
  };
  const needsClone = morph || steps.some((step) => step.kind === "pipe");
  const clone = meta.clone;
  let callable = validate;
  if (needsClone && clone !== undefined) {
    if (clone === false) {
      callable = (data, path) => {
        const out = validate(data, path);
        if (out instanceof OmpErrors || out === data || typeof data !== "object" || data === null || typeof out !== "object" || out === null) {
          return out;
        }
        if (Array.isArray(data) && Array.isArray(out)) {
          data.splice(0, data.length, ...out);
        } else {
          const target = data;
          const source = out;
          for (const key of Reflect.ownKeys(target)) {
            if (!Object.hasOwn(source, key))
              Reflect.deleteProperty(target, key);
          }
          for (const key of Reflect.ownKeys(source))
            target[key] = source[key];
        }
        return data;
      };
    } else {
      callable = (data, path) => validate(clone(data), path);
    }
  }
  if (meta.hasDefault === true) {
    const inner = callable;
    const value = meta.defaultValue;
    callable = (data, path) => {
      if (data !== undefined)
        return inner(data, path);
      if (meta.hasDefaultOutput === true)
        return meta.defaultOutput;
      return inner(typeof value === "function" ? value() : value, path);
    };
  }
  const self = callable;
  self[IR_BRAND] = true;
  self[kBase] = base;
  self[kSteps] = steps;
  self.ir = ir;
  self.hasSteps = steps.length > 0;
  self.hasDefault = meta.hasDefault === true;
  self.defaultValue = meta.defaultValue;
  self.defaultOutput = meta.defaultOutput;
  self.hasDefaultOutput = meta.hasDefaultOutput === true;
  self.errorConfig = meta.errorConfig ?? ir.cfg;
  self.clone = meta.clone;
  self.run = callable;
  self.$ = ARK_COMPAT_SCOPE;
  for (let i = steps.length - 1;i >= 0; i--) {
    const step = steps[i];
    if (step.kind !== "pipe")
      continue;
    self.stepOut = step.out;
    self.opaqueOutput = step.out === undefined;
    break;
  }
  Object.setPrototypeOf(self, typeMethods);
  return self;
}
function appendPipes(source, pipes, catchErrors, forcePipeline = false) {
  let schema = source;
  for (const candidate of pipes) {
    const isSchema = (typeof candidate === "function" || typeof candidate === "object" && candidate !== null) && IR_BRAND in candidate;
    if (isSchema) {
      const target = candidate;
      if (!forcePipeline && schema[kSteps].length === 0 && !target.hasSteps && !hasMorph(schema.ir) && !hasMorph(target.ir)) {
        schema = makeType(intersect(schema.ir, target.ir), [], metaOf(schema));
        continue;
      }
      const out = target.opaqueOutput ? undefined : target.stepOut ?? target.ir;
      schema = makeType(schema.ir, [...schema[kSteps], { kind: "pipe", fn: (value) => target.run(value), out, try: catchErrors }], metaOf(schema));
      continue;
    }
    if (typeof candidate !== "function")
      throw new OmpTypeError("pipe operands must be functions or Types");
    schema = makeType(schema.ir, [...schema[kSteps], { kind: "pipe", fn: candidate, try: catchErrors }], metaOf(schema));
  }
  return inheritScope(source, schema);
}
function projectIO(ir, io) {
  switch (ir.k) {
    case "morph":
      return projectIO(io === "in" || ir.out === undefined ? ir.input : ir.out, io);
    case "sub":
      if (io === "out" && ir.schema.opaqueOutput)
        return { k: "unknown" };
      return projectIO(io === "out" ? ir.schema.stepOut ?? ir.schema.ir : ir.schema.ir, io);
    case "array":
      return { ...ir, el: projectIO(ir.el, io) };
    case "tuple":
      return {
        ...ir,
        prefix: ir.prefix.map((item) => ({
          ...item,
          opt: io === "in" ? item.opt || item.hasDefault === true : item.opt && !item.hasDefault,
          val: projectIO(item.val, io),
          hasDefault: false,
          def: undefined,
          defFactory: false,
          defValidated: false
        })),
        variadic: ir.variadic === undefined ? undefined : projectIO(ir.variadic, io),
        postfix: ir.postfix.map((item) => projectIO(item, io))
      };
    case "object":
      return {
        ...ir,
        props: ir.props.map((prop) => ({
          ...prop,
          opt: io === "in" ? prop.opt || prop.hasDefault === true : prop.opt && !prop.hasDefault,
          val: projectIO(prop.val, io),
          hasDefault: false,
          def: undefined,
          defFactory: false,
          defValidated: false
        })),
        index: ir.index === undefined ? undefined : projectIO(ir.index, io),
        symbolIndex: ir.symbolIndex === undefined ? undefined : projectIO(ir.symbolIndex, io),
        patternIndexes: ir.patternIndexes?.map((index) => ({
          key: projectIO(index.key, io),
          val: projectIO(index.val, io)
        })),
        extras: ir.extras === "delete" ? io === "in" ? "keep" : "reject" : ir.extras
      };
    case "union":
    case "intersection":
      return { ...ir, members: ir.members.map((member) => projectIO(member, io)) };
    case "refine":
      return { ...ir, base: projectIO(ir.base, io) };
    case "alias":
      return { ...ir, resolve: () => projectIO(ir.resolve(), io) };
    default:
      return ir;
  }
}
function morphIdentities(ir, identities = [], seen = new Set) {
  if (seen.has(ir))
    return identities;
  seen.add(ir);
  switch (ir.k) {
    case "morph":
      identities.push(ir.out === undefined ? ir.fn : `declared:${expressionOf(projectIO(ir.input, "in"))}=>${expressionOf(projectIO(ir.out, "out"))}`);
      morphIdentities(ir.input, identities, seen);
      if (ir.out !== undefined)
        morphIdentities(ir.out, identities, seen);
      break;
    case "sub": {
      const schema = ir.schema;
      for (const step of schema[kSteps])
        if (step.kind === "pipe")
          identities.push(step.fn);
      morphIdentities(schema.ir, identities, seen);
      break;
    }
    case "array":
      morphIdentities(ir.el, identities, seen);
      break;
    case "tuple":
      for (const item of ir.prefix)
        morphIdentities(item.val, identities, seen);
      if (ir.variadic !== undefined)
        morphIdentities(ir.variadic, identities, seen);
      for (const item of ir.postfix)
        morphIdentities(item, identities, seen);
      break;
    case "object":
      if (ir.extras === "delete")
        identities.push(ir);
      for (const prop of ir.props)
        morphIdentities(prop.val, identities, seen);
      if (ir.index !== undefined)
        morphIdentities(ir.index, identities, seen);
      if (ir.symbolIndex !== undefined)
        morphIdentities(ir.symbolIndex, identities, seen);
      for (const index of ir.patternIndexes ?? [])
        morphIdentities(index.val, identities, seen);
      break;
    case "union":
    case "intersection":
      for (const member of ir.members)
        morphIdentities(member, identities, seen);
      break;
    case "refine":
      morphIdentities(ir.base, identities, seen);
      break;
    case "alias":
      morphIdentities(ir.resolve(), identities, seen);
      break;
  }
  return identities;
}
function assertDeterminateMorphUnions(ir, seen = new Set) {
  if (seen.has(ir))
    return;
  seen.add(ir);
  if (ir.k === "union") {
    for (let leftIndex = 0;leftIndex < ir.members.length; leftIndex++) {
      const left = ir.members[leftIndex];
      const leftMorphs = morphIdentities(left);
      for (let rightIndex = leftIndex + 1;rightIndex < ir.members.length; rightIndex++) {
        const right = ir.members[rightIndex];
        const rightMorphs = morphIdentities(right);
        if (leftMorphs.length === 0 && rightMorphs.length === 0)
          continue;
        if (leftMorphs.length === rightMorphs.length && leftMorphs.every((identity, index) => identity === rightMorphs[index])) {
          continue;
        }
        let leftInput = projectIO(left, "in");
        let rightInput = projectIO(right, "in");
        if (leftInput.k === "alias")
          leftInput = leftInput.resolve();
        if (rightInput.k === "alias")
          rightInput = rightInput.resolve();
        if (leftInput.k === "object" && rightInput.k === "object") {
          const leftKeys = new Set(leftInput.props.map((prop) => prop.key));
          const rightKeys = new Set(rightInput.props.map((prop) => prop.key));
          const leftRejectsRequiredRight = leftInput.extras === "reject" && rightInput.props.some((prop) => !prop.opt && !prop.hasDefault && !leftKeys.has(prop.key));
          const rightRejectsRequiredLeft = rightInput.extras === "reject" && leftInput.props.some((prop) => !prop.opt && !prop.hasDefault && !rightKeys.has(prop.key));
          if (leftRejectsRequiredRight || rightRejectsRequiredLeft)
            continue;
        }
        try {
          intersect(leftInput, rightInput);
        } catch (error) {
          if (error instanceof OmpTypeError)
            continue;
          throw error;
        }
        throw new OmpTypeError("an unordered union with overlapping morph inputs is indeterminate");
      }
    }
  }
  switch (ir.k) {
    case "alias":
      assertDeterminateMorphUnions(ir.resolve(), seen);
      break;
    case "morph":
      assertDeterminateMorphUnions(ir.input, seen);
      if (ir.out !== undefined)
        assertDeterminateMorphUnions(ir.out, seen);
      break;
    case "sub":
      assertDeterminateMorphUnions(ir.schema.ir, seen);
      break;
    case "array":
      assertDeterminateMorphUnions(ir.el, seen);
      break;
    case "tuple":
      for (const item of ir.prefix)
        assertDeterminateMorphUnions(item.val, seen);
      if (ir.variadic !== undefined)
        assertDeterminateMorphUnions(ir.variadic, seen);
      for (const item of ir.postfix)
        assertDeterminateMorphUnions(item, seen);
      break;
    case "object":
      for (const prop of ir.props)
        assertDeterminateMorphUnions(prop.val, seen);
      if (ir.index !== undefined)
        assertDeterminateMorphUnions(ir.index, seen);
      if (ir.symbolIndex !== undefined)
        assertDeterminateMorphUnions(ir.symbolIndex, seen);
      for (const index of ir.patternIndexes ?? [])
        assertDeterminateMorphUnions(index.val, seen);
      break;
    case "union":
    case "intersection":
      for (const member of ir.members)
        assertDeterminateMorphUnions(member, seen);
      break;
    case "refine":
      assertDeterminateMorphUnions(ir.base, seen);
      break;
  }
}
function getPathIR(ir, requestedKey) {
  let key = requestedKey;
  if ((typeof key === "function" || typeof key === "object" && key !== null) && IR_BRAND in key) {
    const keySchema = key;
    if (keySchema.ir.k === "symbol")
      key = Symbol.for("omptype.index");
    else {
      const arrayIndex = type.arrayIndex;
      if (keySchema === arrayIndex)
        key = 0;
      else {
        throw new OmpTypeError(`${keySchema.expression} is not allowed as an array or object index; use a concrete property key`);
      }
    }
  }
  if (typeof key !== "string" && typeof key !== "number" && typeof key !== "symbol") {
    throw new OmpTypeError(`get keys must be strings, numbers, or symbols`);
  }
  if (ir.k === "alias")
    return getPathIR(ir.resolve(), key);
  if (ir.k === "sub")
    return getPathIR(ir.schema.ir, key);
  if (ir.k === "union") {
    return unionOf(ir.members.map((member) => getPathIR(member, key)));
  }
  if (ir.k === "array") {
    const index = typeof key === "number" ? key : typeof key === "string" && /^\d+$/.test(key) ? Number(key) : -1;
    if (!Number.isSafeInteger(index) || index < 0)
      throw new OmpTypeError(`key ${String(key)} is not declared`);
    return unionOf([ir.el, { k: "undefined" }]);
  }
  if (ir.k === "tuple") {
    const index = typeof key === "number" ? key : typeof key === "string" && /^\d+$/.test(key) ? Number(key) : -1;
    if (!Number.isSafeInteger(index) || index < 0)
      throw new OmpTypeError(`key ${String(key)} is not declared`);
    if (index < ir.prefix.length) {
      const item = ir.prefix[index];
      return item.opt ? unionOf([{ k: "undefined" }, item.val]) : item.val;
    }
    if (ir.variadic === undefined)
      throw new OmpTypeError(`key ${String(key)} is not declared`);
    return unionOf([{ k: "undefined" }, ir.variadic, ...ir.postfix]);
  }
  if (ir.k === "undefined")
    return ir;
  if (ir.k !== "object")
    throw new OmpTypeError("get requires an object schema");
  const matches = [];
  const prop = ir.props.find((candidate) => candidate.key === String(key));
  if (prop !== undefined)
    matches.push(prop.val);
  if (typeof key === "string") {
    if (ir.index !== undefined)
      matches.push(ir.index);
    for (const index of ir.patternIndexes ?? []) {
      if (!(walk(index.key, key) instanceof OmpErrors))
        matches.push(index.val);
    }
  } else if (typeof key === "symbol" && ir.symbolIndex !== undefined) {
    matches.push(ir.symbolIndex);
  }
  if (matches.length === 0)
    throw new OmpTypeError(`key ${String(key)} is not declared`);
  const value = matches.reduce((left, right) => intersect(left, right));
  return prop !== undefined && !prop.opt ? value : unionOf([value, { k: "undefined" }]);
}
function unionOf(members) {
  const flattened = members.flatMap((member) => member.k === "union" ? member.members : [member]);
  return flattened.length === 1 ? flattened[0] : { k: "union", members: flattened };
}
function expressionOf(ir, ancestors = new Set) {
  if (ancestors.has(ir))
    return ir.k === "alias" ? ir.name : ir.k;
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(ir);
  const child = (node) => expressionOf(node, nextAncestors);
  switch (ir.k) {
    case "alias":
      return child(ir.resolve());
    case "sub":
      return child(ir.schema.ir);
    case "unknown":
    case "null":
    case "undefined":
    case "boolean":
    case "bigint":
    case "symbol":
    case "never":
      return ir.k;
    case "anyobject":
      return "object";
    case "string":
      return "string";
    case "number":
      return ir.divisor !== undefined ? `number % ${ir.divisor}` : ir.int ? "number % 1" : "number";
    case "lit":
      return typeof ir.v === "string" ? JSON.stringify(ir.v) : String(ir.v);
    case "array": {
      const element = child(ir.el);
      return `${ir.el.k === "union" || ir.el.k === "intersection" ? `(${element})` : element}[]`;
    }
    case "tuple": {
      const items = ir.prefix.map((item) => {
        const value = child(item.val);
        if (item.hasDefault)
          return `${value} = ${child({ k: "lit", v: item.def })}`;
        return `${value}${item.opt ? "?" : ""}`;
      });
      if (ir.variadic !== undefined)
        items.push(`...${child(ir.variadic)}[]`);
      items.push(...ir.postfix.map(child));
      return `[${items.join(", ")}]`;
    }
    case "object": {
      const properties = ir.props.map((prop) => `${String(prop.key)}${prop.opt ? "?" : ""}: ${child(prop.val)}`);
      if (ir.index !== undefined)
        properties.unshift(`[string]: ${child(ir.index)}`);
      if (ir.symbolIndex !== undefined)
        properties.unshift(`[symbol]: ${child(ir.symbolIndex)}`);
      return `{ ${properties.join(", ")} }`;
    }
    case "union":
      return [...new Set(ir.members.map(child))].join(" | ");
    case "intersection":
      return ir.members.map(child).join(" & ");
    case "refine":
      return child(ir.base);
    case "morph":
      return `(In: ${child(ir.input)}) => Out<${child(ir.out ?? { k: "unknown" })}>`;
    case "instance":
      return ir.ctor.name || "object";
  }
}
function arkJsonOf(ir, ancestors = new Set) {
  if (ancestors.has(ir))
    return ir.k === "alias" ? { alias: ir.name } : { cyclic: ir.k };
  const nextAncestors = new Set(ancestors);
  nextAncestors.add(ir);
  const child = (node) => arkJsonOf(node, nextAncestors);
  switch (ir.k) {
    case "alias":
      return child(ir.resolve());
    case "sub":
      return child(ir.schema.ir);
    case "lit":
      return {
        unit: ir.v === undefined ? "undefined" : typeof ir.v === "bigint" ? `${ir.v}n` : ir.v
      };
    case "null":
      return { unit: null };
    case "undefined":
      return { unit: "undefined" };
    case "boolean":
      return [{ unit: false }, { unit: true }];
    case "union":
    case "intersection":
      return ir.members.map(child);
    case "array":
      return { proto: "Array", sequence: child(ir.el) };
    case "tuple":
      return {
        proto: "Array",
        sequence: {
          prefix: ir.prefix.map((item) => child(item.val)),
          ...ir.variadic === undefined ? {} : { variadic: child(ir.variadic) },
          ...ir.postfix.length === 0 ? {} : { postfix: ir.postfix.map(child) }
        }
      };
    case "object":
      return {
        domain: "object",
        required: ir.props.filter((prop) => !prop.opt && !prop.hasDefault).map((prop) => ({ key: prop.key, value: child(prop.val) })),
        optional: ir.props.filter((prop) => prop.opt || prop.hasDefault).map((prop) => ({
          key: prop.key,
          value: child(prop.val),
          ...prop.hasDefault ? {
            default: prop.defFactory && typeof prop.def === "function" ? `$ark.${prop.def.name || "default"}` : prop.def
          } : {}
        }))
      };
    case "refine":
      return child(ir.base);
    case "morph":
      return { in: child(ir.input), ...ir.out === undefined ? {} : { declaredOut: child(ir.out) } };
    case "instance":
      return { proto: ir.ctor.name };
    case "anyobject":
      return { domain: "object" };
    default:
      return ir.k;
  }
}
function requireObject(ir, operation) {
  if (ir.k !== "object")
    throw new OmpTypeError(`${operation} requires an object schema`);
  return ir;
}
function selectObjectProps(ir, keys, keepSelected, operation) {
  const object = requireObject(ir, operation);
  const selected = new Set(keys);
  for (const key of selected) {
    if (!object.props.some((prop) => prop.key === key))
      throw new OmpTypeError(`key ${String(key)} does not exist`);
  }
  return { ...object, props: object.props.filter((prop) => selected.has(prop.key) === keepSelected) };
}
function setObjectOptionality(ir, optional, operation) {
  const object = requireObject(ir, operation);
  return { ...object, props: object.props.map((prop) => ({ ...prop, opt: optional })) };
}
function mergeObjectDefinition(ir, definition, resolve) {
  return mergeObjects(requireObject(ir, "merge"), requireObject(parseDef(definition, resolve), "merge"));
}
function propertyFromIR(prop) {
  return {
    kind: prop.opt ? "optional" : "required",
    key: prop.key,
    value: makeType(prop.val, [], {}),
    ...prop.hasDefault ? { default: prop.def } : {},
    meta: {}
  };
}
function propertyToIR(property) {
  if (property.kind !== "required" && property.kind !== "optional") {
    throw new OmpTypeError(`mapped property ${String(property.key)} has invalid kind`);
  }
  if (!(IR_BRAND in property.value)) {
    throw new OmpTypeError(`mapped property ${String(property.key)} must contain a schema value`);
  }
  const hasDefault = Object.hasOwn(property, "default");
  return {
    key: property.key,
    opt: property.kind === "optional",
    val: embed(property.value),
    ...hasDefault ? { def: property.default, defFactory: typeof property.default === "function", hasDefault: true } : {}
  };
}
function acceptsDateIR(ir) {
  if (ir.k === "instance")
    return ir.ctor === Date;
  if (ir.k === "refine")
    return acceptsDateIR(ir.base);
  if (ir.k === "union")
    return ir.members.every(acceptsDateIR);
  return false;
}
function dateRefinement(schema, timestamp, relation, predicate) {
  if (!Number.isFinite(timestamp))
    throw new OmpTypeError("date bound must be valid");
  if (!acceptsDateIR(schema.ir))
    throw new OmpTypeError("date bounds require a Date type");
  const bound = new Date(timestamp);
  return makeType({
    k: "refine",
    base: schema.ir,
    pred: (value) => value instanceof Date && predicate(value.valueOf()),
    expected: `a Date ${relation} ${bound.toISOString()}`,
    json: relation.includes("after") ? { minimum: bound.toISOString() } : { maximum: bound.toISOString() }
  }, schema[kSteps], metaOf(schema));
}
function selectNodes(root, kind) {
  const selected = [];
  const seen = new Set;
  const visit = (node) => {
    if (seen.has(node))
      return;
    seen.add(node);
    const nodeKind = node.k === "lit" ? "unit" : node.k;
    if (kind === nodeKind || kind === node.k) {
      selected.push(node.k === "lit" ? { kind: nodeKind, node, unit: node.v } : { kind: nodeKind, node });
    }
    switch (node.k) {
      case "alias":
        visit(node.resolve());
        break;
      case "array":
        visit(node.el);
        break;
      case "tuple":
        for (const item of node.prefix)
          visit(item.val);
        if (node.variadic !== undefined)
          visit(node.variadic);
        for (const item of node.postfix)
          visit(item);
        break;
      case "object":
        for (const prop of node.props)
          visit(prop.val);
        if (node.index !== undefined)
          visit(node.index);
        if (node.symbolIndex !== undefined)
          visit(node.symbolIndex);
        for (const index of node.patternIndexes ?? []) {
          visit(index.key);
          visit(index.val);
        }
        break;
      case "union":
      case "intersection":
        for (const member of node.members)
          visit(member);
        break;
      case "refine":
        visit(node.base);
        break;
      case "morph":
        visit(node.input);
        if (node.out !== undefined)
          visit(node.out);
        break;
      case "sub":
        visit(node.schema.ir);
        break;
    }
  };
  visit(root);
  return selected;
}
function mergeObjects(left, right) {
  const props = [...left.props];
  for (const prop of right.props) {
    const index = props.findIndex((candidate) => candidate.key === prop.key);
    if (index < 0)
      props.push(prop);
    else
      props[index] = prop;
  }
  return {
    k: "object",
    props,
    index: right.index ?? left.index,
    symbolIndex: right.symbolIndex ?? left.symbolIndex,
    patternIndexes: left.patternIndexes === undefined && right.patternIndexes === undefined ? undefined : [...left.patternIndexes ?? [], ...right.patternIndexes ?? []],
    extras: right.extras === "keep" ? left.extras : right.extras
  };
}
function withShallowExtras(ir, extras) {
  if (ir.k === "object")
    return { ...ir, extras };
  if (ir.k === "union")
    return { ...ir, members: ir.members.map((member) => withShallowExtras(member, extras)) };
  if (ir.k === "alias")
    return withShallowExtras(ir.resolve(), extras);
  throw new OmpTypeError("onUndeclaredKey requires an object schema");
}
function withDeepExtras(ir, extras) {
  switch (ir.k) {
    case "object":
      return {
        ...ir,
        extras,
        props: ir.props.map((prop) => ({ ...prop, val: withDeepExtras(prop.val, extras) })),
        index: ir.index === undefined ? undefined : withDeepExtras(ir.index, extras),
        symbolIndex: ir.symbolIndex === undefined ? undefined : withDeepExtras(ir.symbolIndex, extras),
        patternIndexes: ir.patternIndexes?.map((index) => ({
          key: withDeepExtras(index.key, extras),
          val: withDeepExtras(index.val, extras)
        }))
      };
    case "array":
      return { ...ir, el: withDeepExtras(ir.el, extras) };
    case "tuple":
      return {
        ...ir,
        prefix: ir.prefix.map((item) => ({ ...item, val: withDeepExtras(item.val, extras) })),
        variadic: ir.variadic === undefined ? undefined : withDeepExtras(ir.variadic, extras),
        postfix: ir.postfix.map((item) => withDeepExtras(item, extras))
      };
    case "union":
    case "intersection":
      return { ...ir, members: ir.members.map((member) => withDeepExtras(member, extras)) };
    case "refine":
      return { ...ir, base: withDeepExtras(ir.base, extras) };
    case "morph":
      return {
        ...ir,
        input: withDeepExtras(ir.input, extras),
        out: ir.out === undefined ? undefined : withDeepExtras(ir.out, extras)
      };
    default:
      return ir;
  }
}
function intersectTupleWithArray(tuple, array) {
  if (array.min !== undefined || array.max !== undefined) {
    return { k: "intersection", members: [tuple, array] };
  }
  return {
    ...tuple,
    prefix: tuple.prefix.map((item) => ({ ...item, val: intersect(item.val, array.el) })),
    variadic: tuple.variadic === undefined ? undefined : intersect(tuple.variadic, array.el),
    postfix: tuple.postfix.map((item) => intersect(item, array.el))
  };
}
function intersectTuples(left, right) {
  if (left.postfix.length !== 0 || right.postfix.length !== 0 || left.prefix.some((item) => item.hasDefault) || right.prefix.some((item) => item.hasDefault)) {
    return { k: "intersection", members: [left, right] };
  }
  const leftRequired = left.prefix.filter((item) => !item.opt).length;
  const rightRequired = right.prefix.filter((item) => !item.opt).length;
  const minimum = Math.max(leftRequired, rightRequired);
  const leftMaximum = left.variadic === undefined ? left.prefix.length : Number.POSITIVE_INFINITY;
  const rightMaximum = right.variadic === undefined ? right.prefix.length : Number.POSITIVE_INFINITY;
  const maximum = Math.min(leftMaximum, rightMaximum);
  if (minimum > maximum)
    throw new OmpTypeError("tuple length intersection is unsatisfiable");
  const prefixLength = Number.isFinite(maximum) ? maximum : Math.max(left.prefix.length, right.prefix.length);
  const prefix = [];
  for (let index = 0;index < prefixLength; index++) {
    const leftItem = left.prefix[index];
    const rightItem = right.prefix[index];
    const leftNode = leftItem?.val ?? left.variadic;
    const rightNode = rightItem?.val ?? right.variadic;
    if (leftNode === undefined || rightNode === undefined)
      break;
    const required = leftItem !== undefined && !leftItem.opt || rightItem !== undefined && !rightItem.opt;
    try {
      prefix.push({ val: intersect(leftNode, rightNode), opt: !required });
    } catch (error) {
      if (required || !(error instanceof OmpTypeError))
        throw error;
      break;
    }
  }
  const variadic = leftMaximum === Number.POSITIVE_INFINITY && rightMaximum === Number.POSITIVE_INFINITY ? intersect(left.variadic, right.variadic) : undefined;
  return { k: "tuple", prefix, variadic, postfix: [] };
}
var kIntersections = Symbol("omptype.intersections");
function intersect(a, b) {
  if (a.k === "alias" || b.k === "alias") {
    const target = a;
    target[kIntersections] ??= new WeakMap;
    const cache = target[kIntersections];
    const existing = cache.get(b);
    if (existing !== undefined)
      return existing;
    let resolved;
    const reference = {
      k: "alias",
      name: a.k === "alias" ? a.name : b.k === "alias" ? b.name : "intersection",
      resolve: () => resolved ??= intersectResolved(a.k === "alias" ? a.resolve() : a, b.k === "alias" ? b.resolve() : b)
    };
    cache.set(b, reference);
    return reference;
  }
  return intersectResolved(a, b);
}
function intersectResolved(a, b) {
  if (a.k === "never" || b.k === "never")
    throw new OmpTypeError("intersection with never is unsatisfiable");
  if (a.k === "unknown")
    return b;
  if (b.k === "unknown")
    return a;
  if (a === b)
    return a;
  if (a.k === "morph" && b.k === "morph") {
    if (a.fn !== b.fn || a.out !== b.out) {
      throw new OmpTypeError("intersection of distinct morphs is indeterminate");
    }
    return { ...a, input: intersect(a.input, b.input) };
  }
  if (a.k === "morph")
    return { ...a, input: intersect(a.input, b) };
  if (b.k === "morph")
    return { ...b, input: intersect(a, b.input) };
  if (a.k === "sub" && a.schema.hasSteps) {
    if (b.k === "sub" && b.schema.hasSteps) {
      if (a.schema === b.schema)
        return a;
      throw new OmpTypeError("intersection of distinct morphs is indeterminate");
    }
    const schema = a.schema;
    return embed(makeType(intersect(schema.ir, b), schema[kSteps], metaOf(schema)));
  }
  if (b.k === "sub" && b.schema.hasSteps)
    return intersect(b, a);
  if (a.k === "union" || b.k === "union") {
    const union = a.k === "union" ? a : b.k === "union" ? b : undefined;
    if (union === undefined)
      throw new OmpTypeError("union intersection invariant failed");
    const branches = union.members;
    const other = a.k === "union" ? b : a;
    const members = [];
    for (const branch of branches) {
      try {
        members.push(intersect(branch, other));
      } catch (error) {
        if (!(error instanceof OmpTypeError))
          throw error;
      }
    }
    if (members.length === 0)
      throw new OmpTypeError("intersection has no satisfiable branches");
    return members.length === 1 ? members[0] : { k: "union", members };
  }
  if (a.k === "lit") {
    if (walk(b, a.v) instanceof OmpErrors)
      throw new OmpTypeError("literal is excluded by the intersection");
    return a;
  }
  if (b.k === "lit")
    return intersect(b, a);
  if (a.k === "object" && b.k === "object") {
    const props = [...a.props];
    for (const bp of b.props) {
      const index = props.findIndex((prop) => prop.key === bp.key);
      if (index < 0)
        props.push(bp);
      else {
        const ap = props[index];
        const required = !ap.opt && !ap.hasDefault || !bp.opt && !bp.hasDefault;
        if (ap.hasDefault && bp.hasDefault && !Object.is(ap.def, bp.def)) {
          throw new OmpTypeError(`ParseError: Invalid intersection of default values ${String(ap.def)} & ${String(bp.def)}`);
        }
        const defaulted = required ? undefined : ap.hasDefault ? ap : bp.hasDefault ? bp : undefined;
        props[index] = {
          key: ap.key,
          opt: ap.opt && bp.opt,
          val: intersect(ap.val, bp.val),
          ...defaulted ? {
            def: defaulted.def,
            defFactory: defaulted.defFactory,
            hasDefault: true,
            defValidated: defaulted.defValidated
          } : {}
        };
      }
    }
    const extras = a.extras === "reject" || b.extras === "reject" ? "reject" : a.extras === "delete" || b.extras === "delete" ? "delete" : "keep";
    const index = a.index && b.index ? intersect(a.index, b.index) : a.index ?? b.index;
    return { k: "object", props, index, extras };
  }
  if (a.k === "string" && b.k === "string") {
    const min = maxOf(a.min, b.min);
    const max = minOf(a.max, b.max);
    if (min !== undefined && max !== undefined && min > max) {
      throw new OmpTypeError("string length intersection is unsatisfiable");
    }
    return { k: "string", min, max, url: a.url || b.url };
  }
  if (a.k === "number" && b.k === "number") {
    const min = maxOf(a.min, b.min);
    const max = minOf(a.max, b.max);
    const xmin = min !== undefined && (a.min === min && a.xmin === true || b.min === min && b.xmin === true);
    const xmax = max !== undefined && (a.max === max && a.xmax === true || b.max === max && b.xmax === true);
    if (min !== undefined && max !== undefined && (min > max || min === max && (xmin || xmax))) {
      throw new OmpTypeError("numeric range intersection is unsatisfiable");
    }
    if (a.divisor !== undefined && b.divisor !== undefined && a.divisor !== b.divisor) {
      return { k: "intersection", members: [a, b] };
    }
    return {
      k: "number",
      int: a.int || b.int,
      divisor: a.divisor ?? b.divisor,
      min,
      max,
      xmin,
      xmax
    };
  }
  if (a.k === "array" && b.k === "array") {
    const min = maxOf(a.min, b.min);
    const max = minOf(a.max, b.max);
    if (min !== undefined && max !== undefined && min > max) {
      throw new OmpTypeError("array length intersection is unsatisfiable");
    }
    return { k: "array", el: intersect(a.el, b.el), min, max };
  }
  if (a.k === "tuple" && b.k === "tuple")
    return intersectTuples(a, b);
  if (a.k === "tuple" && b.k === "array")
    return intersectTupleWithArray(a, b);
  if (a.k === "array" && b.k === "tuple")
    return intersectTupleWithArray(b, a);
  if (a.k === "instance" && b.k === "instance") {
    if (a.ctor === b.ctor || a.ctor.prototype instanceof b.ctor)
      return a;
    if (b.ctor.prototype instanceof a.ctor)
      return b;
    throw new OmpTypeError(`intersection of ${a.expected} and ${b.expected} is unsatisfiable`);
  }
  if (a.k === b.k && ["null", "undefined", "boolean", "bigint", "symbol", "anyobject"].includes(a.k))
    return a;
  if (a.k === "object" && (b.k === "array" || b.k === "tuple") || b.k === "object" && (a.k === "array" || a.k === "tuple")) {
    return { k: "intersection", members: [a, b] };
  }
  const leftDomain = domainOf(a);
  const rightDomain = domainOf(b);
  if (leftDomain !== undefined && rightDomain !== undefined && leftDomain !== rightDomain) {
    throw new OmpTypeError(`intersection of ${leftDomain} and ${rightDomain} is unsatisfiable`);
  }
  if (a.k === "anyobject" && rightDomain === "object")
    return b;
  if (b.k === "anyobject" && leftDomain === "object")
    return a;
  const members = [...a.k === "intersection" ? a.members : [a], ...b.k === "intersection" ? b.members : [b]];
  return { k: "intersection", members };
}
function normalizeIR(ir) {
  switch (ir.k) {
    case "intersection": {
      const members = ir.members.map(normalizeIR);
      if (members.length === 0)
        return { k: "unknown" };
      return members.slice(1).reduce(intersect, members[0]);
    }
    case "union": {
      const members = [];
      let changed = false;
      for (let index = 0;index < ir.members.length; index++) {
        const original = ir.members[index];
        const member = normalizeIR(original);
        changed ||= member !== original;
        if (member.k === "union") {
          members.push(...member.members);
          changed = true;
        } else if (member.k === "never") {
          changed = true;
        } else if (member.k === "unknown") {
          return { k: "unknown" };
        } else {
          members.push(member);
        }
      }
      if (members.every((member) => member.k === "lit" && (member.v === null || typeof member.v !== "object" && typeof member.v !== "function"))) {
        const pruned = [];
        for (const member of members) {
          if (member.k === "lit" && pruned.some((candidate) => candidate.k === "lit" && candidate.v === member.v)) {
            changed = true;
          } else {
            pruned.push(member);
          }
        }
        if (pruned.length === 0)
          return { k: "never" };
        if (pruned.length === 1)
          return pruned[0];
        if (pruned.length === 2 && pruned.every((member) => member.k === "lit" && typeof member.v === "boolean")) {
          return { k: "boolean" };
        }
        return changed ? { ...ir, members: pruned } : ir;
      }
      const pruned = members.filter((member, index) => !members.some((candidate, candidateIndex) => candidateIndex !== index && !hasMorph(member) && !hasMorph(candidate) && isSubtype(member, candidate) && (!isSubtype(candidate, member) || candidateIndex < index)));
      if (pruned.length === 0)
        return { k: "never" };
      if (pruned.length === 1)
        return pruned[0];
      if (pruned.length === 2 && pruned.every((member) => member.k === "lit" && typeof member.v === "boolean")) {
        return { k: "boolean" };
      }
      if (!changed && !pruned.some((member) => member.k === "alias") && pruned.length === ir.members.length && pruned.every((member, index) => member === ir.members[index])) {
        return ir;
      }
      return { ...ir, members: pruned };
    }
    case "array": {
      const element = normalizeIR(ir.el);
      return element === ir.el && ir.el.k !== "alias" ? ir : { ...ir, el: element };
    }
    case "tuple": {
      const prefix = ir.prefix.map((item) => {
        const value = normalizeIR(item.val);
        return value === item.val ? item : { ...item, val: value };
      });
      const variadic = ir.variadic === undefined ? undefined : normalizeIR(ir.variadic);
      const postfix = ir.postfix.map(normalizeIR);
      if (!ir.prefix.some((item) => item.val.k === "alias") && ir.variadic?.k !== "alias" && !ir.postfix.some((item) => item.k === "alias") && prefix.every((item, index) => item === ir.prefix[index]) && variadic === ir.variadic && postfix.every((item, index) => item === ir.postfix[index])) {
        return ir;
      }
      return { ...ir, prefix, variadic, postfix };
    }
    case "object": {
      let props;
      for (let index = 0;index < ir.props.length; index++) {
        const prop = ir.props[index];
        const value = normalizeIR(prop.val);
        if (value === prop.val)
          continue;
        props ??= [...ir.props];
        props[index] = { ...prop, val: value };
      }
      const index = ir.index === undefined ? undefined : normalizeIR(ir.index);
      const symbolIndex = ir.symbolIndex === undefined ? undefined : normalizeIR(ir.symbolIndex);
      const patternIndexes = ir.patternIndexes?.map((pattern) => {
        const key = normalizeIR(pattern.key);
        const val = normalizeIR(pattern.val);
        return key === pattern.key && val === pattern.val ? pattern : { key, val };
      });
      if (props === undefined && !ir.props.some((prop) => prop.val.k === "alias") && ir.index?.k !== "alias" && ir.symbolIndex?.k !== "alias" && !ir.patternIndexes?.some((pattern) => pattern.key.k === "alias" || pattern.val.k === "alias") && index === ir.index && symbolIndex === ir.symbolIndex && patternIndexes?.every((pattern, patternIndex) => pattern === ir.patternIndexes?.[patternIndex]) !== false) {
        return ir;
      }
      return { ...ir, props: props ?? ir.props, index, symbolIndex, patternIndexes };
    }
    case "refine": {
      const base = normalizeIR(ir.base);
      return base === ir.base && ir.base.k !== "alias" ? ir : { ...ir, base };
    }
    case "morph": {
      const input = normalizeIR(ir.input);
      const out = ir.out === undefined ? undefined : normalizeIR(ir.out);
      return input === ir.input && out === ir.out && ir.input.k !== "alias" && ir.out?.k !== "alias" ? ir : { ...ir, input, out };
    }
    case "alias":
      return ir;
    default:
      return ir;
  }
}
function domainOf(ir) {
  switch (ir.k) {
    case "null":
      return "null";
    case "undefined":
    case "boolean":
    case "bigint":
    case "symbol":
    case "string":
    case "number":
      return ir.k;
    case "array":
    case "tuple":
      return "array";
    case "object":
    case "anyobject":
    case "instance":
      return "object";
    case "lit":
      return ir.v === null ? "null" : Array.isArray(ir.v) ? "array" : typeof ir.v;
    case "refine":
      return domainOf(ir.base);
    case "morph":
      return domainOf(ir.input);
    case "sub":
      return domainOf(ir.schema.ir);
    case "alias":
      return domainOf(ir.resolve());
    case "union":
    case "intersection": {
      const first = domainOf(ir.members[0] ?? { k: "never" });
      return ir.members.every((member) => domainOf(member) === first) ? first : undefined;
    }
    default:
      return;
  }
}
function lowerBoundWithin(source, target) {
  if (target.min === undefined)
    return true;
  if (source.min === undefined || source.min < target.min)
    return false;
  return source.min !== target.min || target.xmin !== true || source.xmin === true;
}
function upperBoundWithin(source, target) {
  if (target.max === undefined)
    return true;
  if (source.max === undefined || source.max > target.max)
    return false;
  return source.max !== target.max || target.xmax !== true || source.xmax === true;
}
function lengthWithin(source, target) {
  return (target.min === undefined || source.min !== undefined && source.min >= target.min) && (target.max === undefined || source.max !== undefined && source.max <= target.max);
}
function isSubtype(source, target, seen = new WeakMap) {
  if (source === target || target.k === "unknown" || source.k === "never")
    return true;
  let targets = seen.get(source);
  if (targets?.has(target))
    return true;
  if (targets === undefined) {
    targets = new Set;
    seen.set(source, targets);
  }
  targets.add(target);
  if (source.k === "alias")
    return isSubtype(source.resolve(), target, seen);
  if (target.k === "alias")
    return isSubtype(source, target.resolve(), seen);
  if (source.k === "union")
    return source.members.every((member) => isSubtype(member, target, seen));
  if (target.k === "union")
    return target.members.some((member) => isSubtype(source, member, seen));
  if (target.k === "intersection")
    return target.members.every((member) => isSubtype(source, member, seen));
  if (source.k === "intersection")
    return source.members.some((member) => isSubtype(member, target, seen));
  if (source.k === "lit")
    return !(walk(target, source.v) instanceof OmpErrors);
  if (source.k === "refine")
    return isSubtype(source.base, target, seen);
  if (source.k === "morph")
    return isSubtype(source.out ?? source.input, target, seen);
  if (source.k === "sub")
    return isSubtype(source.schema.ir, target, seen);
  if (target.k === "refine" || target.k === "morph" || target.k === "sub")
    return false;
  if (source.k === "string" && target.k === "string") {
    return lengthWithin(source, target) && (!target.url || source.url === true);
  }
  if (source.k === "number" && target.k === "number") {
    return lowerBoundWithin(source, target) && upperBoundWithin(source, target) && (!target.int || source.int === true) && (target.divisor === undefined || source.divisor !== undefined && source.divisor % target.divisor === 0);
  }
  if (source.k === "array" && target.k === "array") {
    return lengthWithin(source, target) && isSubtype(source.el, target.el, seen);
  }
  if (source.k === "object" && target.k === "object") {
    for (const targetProp of target.props) {
      const sourceProp = source.props.find((prop) => prop.key === targetProp.key);
      if (sourceProp === undefined) {
        if (!targetProp.opt)
          return false;
        continue;
      }
      if (!targetProp.opt && sourceProp.opt)
        return false;
      if (!isSubtype(sourceProp.val, targetProp.val, seen))
        return false;
    }
    if (target.extras === "reject") {
      if (source.extras !== "reject")
        return false;
      if (target.index === undefined && source.props.some((sourceProp) => !target.props.some((targetProp) => targetProp.key === sourceProp.key))) {
        return false;
      }
    }
    return true;
  }
  if (source.k === "instance" && target.k === "instance") {
    return source.ctor === target.ctor || source.ctor.prototype instanceof target.ctor;
  }
  if (source.k === "object" && target.k === "anyobject")
    return true;
  if (source.k === "instance" && target.k === "anyobject")
    return true;
  if (source.k === "tuple" && target.k === "array") {
    return source.prefix.every((item) => isSubtype(item.val, target.el, seen)) && source.postfix.every((item) => isSubtype(item, target.el, seen)) && (source.variadic === undefined || isSubtype(source.variadic, target.el, seen));
  }
  if (source.k !== target.k)
    return false;
  switch (source.k) {
    case "null":
    case "undefined":
    case "boolean":
    case "bigint":
    case "symbol":
    case "anyobject":
      return true;
    case "tuple":
      return target.k === "tuple" && expectedTuple(source) === expectedTuple(target);
    case "instance":
      return target.k === "instance" && source.ctor === target.ctor;
    default:
      return false;
  }
}
function expectedTuple(tuple) {
  return JSON.stringify({
    prefix: tuple.prefix.map((item) => [item.opt, item.hasDefault, expectedOf(item.val)]),
    variadic: tuple.variadic === undefined ? undefined : expectedOf(tuple.variadic),
    postfix: tuple.postfix.map(expectedOf)
  });
}
function irEquals(left, right) {
  return isSubtype(left, right) && isSubtype(right, left);
}
function maxOf(a, b) {
  if (a === undefined)
    return b;
  if (b === undefined)
    return a;
  return Math.max(a, b);
}
function minOf(a, b) {
  if (a === undefined)
    return b;
  if (b === undefined)
    return a;
  return Math.min(a, b);
}
function withLengthBound(ir, side, bound) {
  if (ir.k === "array" || ir.k === "string") {
    return side === "min" ? { ...ir, min: bound } : { ...ir, max: bound };
  }
  throw new OmpTypeError(`cannot apply length bound to ${ir.k}`);
}
function withNumericBound(ir, side, bound, exclusive = false) {
  if (!Number.isFinite(bound))
    throw new OmpTypeError("numeric bound must be finite");
  if (ir.k === "number") {
    return side === "min" ? { ...ir, min: bound, xmin: exclusive } : { ...ir, max: bound, xmax: exclusive };
  }
  if (ir.k === "union") {
    return { ...ir, members: ir.members.map((member) => withNumericBound(member, side, bound, exclusive)) };
  }
  throw new OmpTypeError(`cannot apply numeric bound to ${ir.k}`);
}
var GENERIC_META = Symbol("omptype.generic");
function validateGenericParameters(parameters) {
  const names = new Set;
  for (const parameter of parameters) {
    if (!/^[A-Za-z_$]\w*$/.test(parameter.name)) {
      throw new OmpTypeError(`invalid generic parameter "${parameter.name}"`);
    }
    if (names.has(parameter.name))
      throw new OmpTypeError(`duplicate generic parameter "${parameter.name}"`);
    names.add(parameter.name);
  }
  if (parameters.length === 0)
    throw new OmpTypeError("generic declarations require at least one parameter");
}
function parseGenericParameters(source) {
  const trimmed = source.trim();
  const body = trimmed.startsWith("<") && trimmed.endsWith(">") ? trimmed.slice(1, -1) : trimmed;
  const parts = [];
  let start = 0;
  let depth = 0;
  let quote = "";
  for (let index = 0;index < body.length; index++) {
    const char = body[index];
    if (quote !== "") {
      if (char === quote && body[index - 1] !== "\\")
        quote = "";
      continue;
    }
    if (char === "'" || char === '"' || char === "`")
      quote = char;
    else if (char === "<" || char === "(" || char === "[")
      depth++;
    else if (char === ">" || char === ")" || char === "]")
      depth = Math.max(0, depth - 1);
    else if (char === "," && depth === 0) {
      parts.push(body.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(body.slice(start).trim());
  const parameters = parts.map((part) => {
    const constrained = part.match(/^([A-Za-z_$]\w*)\s+extends\s+(.+)$/s);
    return constrained === null ? { name: part } : { name: constrained[1], constraintDef: constrained[2].trim() };
  });
  validateGenericParameters(parameters);
  return parameters;
}
function parseGenericDeclaration(source) {
  const match = source.trim().match(/^([A-Za-z_$]\w*)\s*(<.*>)$/s);
  if (match === null)
    return;
  return { name: match[1], parameters: parseGenericParameters(match[2]) };
}
function isRuntimeGeneric(value) {
  return typeof value === "function" && GENERIC_META in value;
}
function genericResolver(parameters, arguments_, outer) {
  const byName = new Map;
  for (let index = 0;index < parameters.length; index++)
    byName.set(parameters[index].name, arguments_[index]);
  const resolve = (name) => byName.get(name) ?? outer?.(name);
  resolve.hasGeneric = outer?.hasGeneric;
  resolve.generic = outer?.generic;
  return resolve;
}
function parseGenericArgument(definition, outer) {
  if (outer === undefined) {
    try {
      return parseDef(definition);
    } catch (error) {
      if (!(error instanceof OmpTypeError) || !error.message.includes('unknown keyword "this"'))
        throw error;
    }
  }
  const root = {};
  const self = {
    k: "alias",
    name: "this",
    resolve: () => {
      if (root.current === undefined || root.current === self)
        throw new OmpTypeError('"this" cannot be used as a root definition');
      return root.current;
    }
  };
  const resolve = (name) => name === "this" ? self : outer?.(name);
  if (outer !== undefined) {
    resolve.hasGeneric = outer.hasGeneric;
    resolve.generic = outer.generic;
  } else {
    markThisOnlyResolver(resolve);
  }
  root.current = parseDef(definition, resolve);
  if (root.current === self)
    throw new OmpTypeError('"this" cannot be used as a root definition');
  return root.current;
}
function genericBodyIR(parameters, definition, arguments_, outer) {
  const resolve = genericResolver(parameters, arguments_, outer);
  const body = typeof definition === "function" && !(IR_BRAND in definition) ? definition(Object.fromEntries(parameters.map((parameter, index) => [
    parameter.name,
    makeType(arguments_[index], EMPTY_STEPS, EMPTY_META)
  ]))) : definition;
  return parseDef(body, resolve);
}
function createRuntimeGeneric(parameters, definition, outer, validateBody = true) {
  const constraintResolve = (name) => outer?.(name);
  constraintResolve.hasGeneric = outer?.hasGeneric;
  constraintResolve.generic = outer?.generic;
  validateGenericParameters(parameters);
  const placeholders = parameters.map((parameter) => parameter.constraintDef === undefined ? { k: "unknown" } : parseDef(parameter.constraintDef, constraintResolve));
  if (validateBody)
    genericBodyIR(parameters, definition, placeholders, outer);
  const meta = {
    parameters,
    instantiateIR(arguments_) {
      if (arguments_.length !== parameters.length) {
        throw new OmpTypeError(`generic expects ${parameters.length} arguments (received ${arguments_.length})`);
      }
      for (let index = 0;index < parameters.length; index++) {
        const parameter = parameters[index];
        if (parameter.constraintDef === undefined)
          continue;
        const constraint = parseDef(parameter.constraintDef, constraintResolve);
        if (!isSubtype(arguments_[index], constraint)) {
          throw new OmpTypeError(`${parameter.name} must be assignable to its constraint`);
        }
      }
      return genericBodyIR(parameters, definition, arguments_, outer);
    }
  };
  const generic = Object.assign((...arguments_) => makeType(meta.instantiateIR(arguments_.map((argument) => parseGenericArgument(argument, outer))), EMPTY_STEPS, EMPTY_META), { [GENERIC_META]: meta });
  Object.defineProperty(generic, GENERIC_META, { value: meta });
  return generic;
}
function type(first) {
  const count = arguments.length;
  if (count === 2 && typeof first === "string" && first.trimStart().startsWith("<")) {
    return createRuntimeGeneric(parseGenericParameters(first), arguments[1]);
  }
  let definition = first;
  if (count !== 1) {
    const expression = new Array(count);
    for (let index = 0;index < count; index++) {
      expression[index] = arguments[index];
    }
    definition = expression;
  }
  return makeType(parseGenericArgument(definition), EMPTY_STEPS, EMPTY_META);
}
function keywordSchema(name) {
  const ir = keywordIR(name);
  if (ir === undefined)
    throw new OmpTypeError(`missing built-in keyword ${name}`);
  return makeType(ir, [], {});
}
function parsedKeyword(name) {
  return Object.assign(keywordSchema(name), {
    parse: keywordSchema(`${name}.parse`)
  });
}
function preformattedKeyword(name) {
  return Object.assign(keywordSchema(name), {
    preformatted: keywordSchema(`${name}.preformatted`)
  });
}
function caseResolver(value) {
  if (typeof value !== "function")
    throw new OmpTypeError("match case values must be functions");
  return (input, ...args) => Reflect.apply(value, undefined, [input, ...args]);
}
function unionIR(branches) {
  const members = branches.map((branch) => branch.schema.ir);
  if (members.length === 0)
    return { k: "never" };
  if (members.length === 1)
    return members[0];
  return { k: "union", members };
}
function publicMatcher(state, fallback) {
  const fallbackResolver = typeof fallback === "function" ? caseResolver(fallback) : undefined;
  const casesIR = unionIR(state.branches);
  let casesSchema;
  if (state.key === undefined || state.branches.length === 0) {
    casesSchema = state.key === undefined ? makeType(casesIR, EMPTY_STEPS, EMPTY_META) : state.parse({ [state.key]: "never" });
  } else {
    const first = state.branches[0].schema.ir;
    if (first.k !== "object")
      throw new OmpTypeError("match.at cases must define object schemas");
    const propertyKey = String(state.key);
    const values = [];
    for (const branch of state.branches) {
      if (branch.schema.ir.k !== "object")
        throw new OmpTypeError("match.at cases must define object schemas");
      const property = branch.schema.ir.props.find((candidate) => candidate.key === propertyKey);
      if (property === undefined)
        throw new OmpTypeError(`match.at case is missing ${propertyKey}`);
      values.push(property.val);
    }
    const value = values.length === 1 ? values[0] : { k: "union", members: values };
    casesSchema = makeType({
      ...first,
      props: first.props.map((property) => property.key === propertyKey ? { ...property, val: value } : property)
    }, EMPTY_STEPS, EMPTY_META);
  }
  const execute = (input, args) => {
    let matchedInput = input;
    if (state.input !== undefined) {
      const validated = state.input.run(input);
      if (validated instanceof OmpErrors)
        return validated;
      matchedInput = validated;
    }
    for (const branch of state.branches) {
      const matched = branch.schema.run(matchedInput);
      if (!(matched instanceof OmpErrors))
        return branch.resolve(matched, ...args);
    }
    if (fallbackResolver !== undefined)
      return fallbackResolver(matchedInput, ...args);
    return casesSchema.run(matchedInput);
  };
  const schema = makeType({ k: "unknown" }, [{ kind: "pipe", fn: (input) => execute(input, []) }], EMPTY_META);
  const callable = (value, ...args) => {
    const result = execute(value, args);
    if ((fallback === "assert" || fallback === "never") && result instanceof OmpErrors) {
      throw new TraversalError(result);
    }
    return result;
  };
  Object.assign(callable, schema);
  Object.setPrototypeOf(callable, typeMethods);
  return callable;
}
function addMatchCases(state, cases) {
  const branches = [...state.branches];
  let fallback;
  for (const rawDefinition of Reflect.ownKeys(cases)) {
    const value = Reflect.get(cases, rawDefinition);
    if (rawDefinition === "default") {
      if (value !== "assert" && value !== "never" && value !== "reject" && typeof value !== "function") {
        throw new OmpTypeError('match default must be "assert", "never", "reject" or a function');
      }
      fallback = value;
      continue;
    }
    const definition = typeof rawDefinition === "symbol" ? rawDefinition : String(rawDefinition);
    const caseDefinition = state.key === undefined ? definition : { [state.key]: definition };
    branches.push({
      definition,
      schema: state.parse(caseDefinition),
      resolve: caseResolver(value)
    });
  }
  const next = { ...state, branches };
  return fallback === undefined ? createMatchParser(next) : publicMatcher(next, fallback);
}
function createMatchParser(state) {
  const parser = (cases) => addMatchCases(state, cases);
  parser.case = (definition, resolver) => {
    const caseDefinition = state.key === undefined ? definition : { [state.key]: definition };
    return createMatchParser({
      ...state,
      branches: [
        ...state.branches,
        {
          definition,
          schema: state.parse(caseDefinition),
          resolve: caseResolver(resolver)
        }
      ]
    });
  };
  parser.match = (cases) => addMatchCases(state, cases);
  parser.default = (fallback) => publicMatcher(state, fallback);
  function at(key, cases) {
    if (state.key !== undefined)
      throw new OmpTypeError("match.at may only be specified once");
    const next = createMatchParser({ ...state, key });
    return cases === undefined ? next : next.match(cases);
  }
  parser.at = at;
  parser.strings = (cases) => {
    if (state.key === undefined)
      throw new OmpTypeError("match.strings requires match.at(key)");
    const definitions = {};
    for (const key of Reflect.ownKeys(cases)) {
      definitions[key === "default" ? key : JSON.stringify(String(key))] = Reflect.get(cases, key);
    }
    return addMatchCases(state, definitions);
  };
  parser.in = (...args) => {
    if (state.input !== undefined)
      throw new OmpTypeError("match.in may only be specified once");
    return createMatchParser({
      ...state,
      ...args.length === 0 ? {} : { input: state.parse(args[0]) }
    });
  };
  return parser;
}
var matchBuilder = createMatchParser({
  parse: (definition) => type.raw(definition),
  branches: []
});
function fnExpression(ir) {
  switch (ir.k) {
    case "unknown":
    case "null":
    case "undefined":
    case "boolean":
    case "bigint":
    case "symbol":
    case "never":
    case "string":
    case "number":
      return ir.k;
    case "anyobject":
      return "object";
    case "lit":
      return typeof ir.v === "string" ? JSON.stringify(ir.v) : String(ir.v);
    case "union":
      return ir.members.map(fnExpression).join(" | ");
    case "intersection":
      return ir.members.map(fnExpression).join(" & ");
    case "array": {
      const element = fnExpression(ir.el);
      return ir.el.k === "unknown" ? "Array" : `${element.includes(" | ") ? `(${element})` : element}[]`;
    }
    case "tuple": {
      const elements = ir.prefix.map((item) => {
        const expression = fnExpression(item.val);
        if (item.hasDefault)
          return `${expression} = ${String(item.def)}`;
        return item.opt ? `${expression}?` : expression;
      });
      if (ir.variadic !== undefined)
        elements.push(`...${fnExpression({ k: "array", el: ir.variadic })}`);
      elements.push(...ir.postfix.map(fnExpression));
      return `[${elements.join(", ")}]`;
    }
    case "object":
      return `{ ${ir.props.map((property) => `${String(property.key)}${property.opt ? "?" : ""}: ${fnExpression(property.val)}`).join(", ")} }`;
    case "refine":
      return fnExpression(ir.base);
    case "morph":
      return `(In: ${fnExpression(ir.input)}) => To<${fnExpression(ir.out ?? { k: "unknown" })}>`;
    case "instance":
      return ir.ctor.name || "object";
    case "alias":
      return fnExpression(ir.resolve());
    case "sub": {
      const schema = ir.schema;
      if (!schema.hasSteps)
        return fnExpression(schema.ir);
      return `(In: ${fnExpression(schema.ir)}) => To<${fnExpression(schema.stepOut ?? { k: "unknown" })}>`;
    }
  }
}
function normalizeFnParameter(definition) {
  if (typeof definition !== "string")
    return definition;
  const optional = definition.match(/^(.*[^\s])\?$/);
  if (optional)
    return [optional[1], "?"];
  const defaulted = definition.match(/^(.*?)\s*=\s*(.+)$/);
  if (defaulted) {
    const source = defaulted[2];
    const value = source === "true" ? true : source === "false" ? false : source === "null" ? null : Number.isNaN(Number(source)) ? source : Number(source);
    return [defaulted[1], "=", value];
  }
  return definition;
}
function makeFn(resolve) {
  function parser(...definitions) {
    const marker = definitions.indexOf(":");
    if (marker !== -1 && (marker !== definitions.length - 2 || definitions.lastIndexOf(":") !== marker)) {
      throw new OmpTypeError(`":" must be followed by exactly one return type e.g:
fn("string", ":", "number")(s => s.length)`);
    }
    const spreadIndexes = [];
    for (let index = 0;index < definitions.length; index++) {
      if (definitions[index] === "...")
        spreadIndexes.push(index);
    }
    if (spreadIndexes.length > 1) {
      const secondSpread = definitions[spreadIndexes[1] + 1];
      if (Array.isArray(secondSpread) && secondSpread.some((element) => typeof element === "string" && (element.endsWith("?") || element.includes("=")))) {
        throw new OmpTypeError("An optional element may not follow a variadic element");
      }
      throw new OmpTypeError("A tuple may have at most one variadic element");
    }
    if (spreadIndexes.length === 1 && spreadIndexes[0] + 2 < (marker === -1 ? definitions.length : marker)) {
      const preceding = definitions.slice(0, spreadIndexes[0]);
      if (preceding.some((element) => typeof element === "string" && (element.endsWith("?") || /\s=\s/.test(element)))) {
        throw new OmpTypeError("A postfix required element cannot follow an optional or defaultable element");
      }
    }
    const parameterDefinitions = (marker === -1 ? definitions : definitions.slice(0, marker)).map(normalizeFnParameter);
    const params = makeType(parseDef(parameterDefinitions, resolve), [], {});
    const returns = marker === -1 ? makeType({ k: "unknown" }, [], {}) : makeType(parseDef(definitions[marker + 1], resolve), [], {});
    const parameterExpression = fnExpression(params.ir);
    const returnsExpression = fnExpression(returns.ir);
    return (implementation) => {
      if (typeof implementation !== "function")
        throw new OmpTypeError("type.fn requires a function implementation");
      const raw = (...arguments_) => {
        const validatedArguments = params.assert(arguments_);
        const result = Reflect.apply(implementation, undefined, validatedArguments);
        return returns.assert(result);
      };
      const typed = raw.bind(undefined);
      Object.defineProperties(typed, {
        name: { value: `bound typed ${implementation.name}`, configurable: true },
        raw: { value: implementation, enumerable: true },
        params: { value: params, enumerable: true },
        returns: { value: returns, enumerable: true },
        expression: {
          value: `(${parameterExpression.slice(1, -1)}) => ${returnsExpression}`,
          enumerable: true
        }
      });
      return typed;
    };
  }
  return Object.assign(parser, { raw: parser });
}
function isTypeValue(value) {
  return (typeof value === "function" || typeof value === "object" && value !== null) && IR_BRAND in value;
}
function resolveAlias(ir) {
  const seen = new Set;
  let current = ir;
  while (current.k === "alias" && !seen.has(current)) {
    seen.add(current);
    current = current.resolve();
  }
  return current;
}
function sameUnionMember(left, right) {
  const a = resolveAlias(left);
  const b = resolveAlias(right);
  if (a.k === "lit" && b.k === "lit")
    return Object.is(a.v, b.v);
  if (a.k !== b.k)
    return false;
  switch (a.k) {
    case "unknown":
    case "never":
    case "null":
    case "undefined":
    case "boolean":
    case "bigint":
    case "symbol":
    case "anyobject":
      return true;
    default:
      return false;
  }
}
function buildOr(definitions, resolve) {
  const members = [];
  const add = (candidate) => {
    const resolved = resolveAlias(candidate);
    if (resolved.k === "unknown") {
      members.length = 0;
      members.push(resolved);
      return false;
    }
    if (resolved.k === "never")
      return true;
    if (resolved.k === "union") {
      for (const member of resolved.members) {
        if (!add(member))
          return false;
      }
      return true;
    }
    if (!members.some((member) => sameUnionMember(member, candidate)))
      members.push(candidate);
    return true;
  };
  for (const definition of definitions) {
    if (!add(parseDef(definition, resolve)))
      break;
  }
  const ir = members.length === 0 ? { k: "never" } : members.length === 1 ? members[0] : { k: "union", members };
  return makeType(ir, [], {});
}
function buildAnd(definitions, resolve) {
  if (definitions.length === 0)
    return makeType({ k: "unknown" }, [], {});
  let ir = parseDef(definitions[0], resolve);
  for (let index = 1;index < definitions.length; index++) {
    ir = intersect(ir, parseDef(definitions[index], resolve));
  }
  return makeType(ir, [], {});
}
function requireNaryObject(ir) {
  const resolved = resolveAlias(ir);
  if (resolved.k !== "object")
    throw new OmpTypeError("merge requires an object schema");
  return resolved;
}
function buildMerge(definitions, resolve) {
  if (definitions.length === 0)
    return makeType({ k: "anyobject" }, [], {});
  let object = requireNaryObject(parseDef(definitions[0], resolve));
  for (let index = 1;index < definitions.length; index++) {
    object = mergeObjects(object, requireNaryObject(parseDef(definitions[index], resolve)));
  }
  return makeType(object, [], {});
}
function buildPipe(definitions, resolve) {
  if (definitions.length === 0)
    return makeType({ k: "unknown" }, [], {});
  const first = definitions[0];
  let schema = typeof first === "function" && !isTypeValue(first) ? appendPipes(makeType({ k: "unknown" }, [], {}), [first], false, true) : isTypeValue(first) ? first : makeType(parseDef(first, resolve), [], {});
  for (let index = 1;index < definitions.length; index++) {
    const definition = definitions[index];
    const pipe = typeof definition === "function" && !isTypeValue(definition) ? definition : isTypeValue(definition) ? definition : makeType(parseDef(definition, resolve), [], {});
    schema = appendPipes(schema, [pipe], false, true);
  }
  return schema;
}
function naryStatics(resolve) {
  return {
    or: (...definitions) => buildOr(definitions, resolve),
    and: (...definitions) => buildAnd(definitions, resolve),
    merge: (...definitions) => buildMerge(definitions, resolve),
    pipe: (...definitions) => buildPipe(definitions, resolve)
  };
}
((type2) => {
  type2.errors = OmpErrors;
  function or(...definitions) {
    return buildOr(definitions);
  }
  type2.or = or;
  function array(definition) {
    return type(definition).array();
  }
  type2.array = array;
  function union(definitions) {
    return buildOr(definitions);
  }
  type2.union = union;
  function tuple(definitions) {
    return type(definitions);
  }
  type2.tuple = tuple;
  function record(key, value) {
    return type2.keywords.Record(key, value);
  }
  type2.record = record;
  function and(...definitions) {
    return buildAnd(definitions);
  }
  type2.and = and;
  function merge(...definitions) {
    return buildMerge(definitions);
  }
  type2.merge = merge;
  function pipe(...definitions) {
    return buildPipe(definitions);
  }
  type2.pipe = pipe;
  const normalize = Object.assign(keywordSchema("string.normalize"), {
    preformatted: keywordSchema("string.normalize.NFC.preformatted"),
    NFC: preformattedKeyword("string.normalize.NFC"),
    NFD: preformattedKeyword("string.normalize.NFD"),
    NFKC: preformattedKeyword("string.normalize.NFKC"),
    NFKD: preformattedKeyword("string.normalize.NFKD")
  });
  const base64 = Object.assign(keywordSchema("string.base64"), {
    url: keywordSchema("string.base64.url")
  });
  const date = Object.assign(parsedKeyword("string.date"), {
    iso: parsedKeyword("string.date.iso"),
    epoch: parsedKeyword("string.date.epoch")
  });
  const ip = Object.assign(keywordSchema("string.ip"), {
    v4: keywordSchema("string.ip.v4"),
    v6: keywordSchema("string.ip.v6")
  });
  const uuid = Object.assign(keywordSchema("string.uuid"), {
    v1: keywordSchema("string.uuid.v1"),
    v2: keywordSchema("string.uuid.v2"),
    v3: keywordSchema("string.uuid.v3"),
    v4: keywordSchema("string.uuid.v4"),
    v5: keywordSchema("string.uuid.v5"),
    v6: keywordSchema("string.uuid.v6"),
    v7: keywordSchema("string.uuid.v7"),
    v8: keywordSchema("string.uuid.v8")
  });
  type2.string = Object.defineProperties(makeType({ k: "string" }, [], {}), Object.getOwnPropertyDescriptors({
    alpha: keywordSchema("string.alpha"),
    alphanumeric: keywordSchema("string.alphanumeric"),
    base64,
    capitalize: preformattedKeyword("string.capitalize"),
    creditCard: keywordSchema("string.creditCard"),
    date,
    digits: keywordSchema("string.digits"),
    email: keywordSchema("string.email"),
    hex: keywordSchema("string.hex"),
    integer: parsedKeyword("string.integer"),
    ip,
    json: parsedKeyword("string.json"),
    lower: preformattedKeyword("string.lower"),
    normalize,
    numeric: parsedKeyword("string.numeric"),
    regex: keywordSchema("string.regex"),
    semver: keywordSchema("string.semver"),
    trim: preformattedKeyword("string.trim"),
    upper: preformattedKeyword("string.upper"),
    url: parsedKeyword("string.url"),
    uuid
  }));
  type2.parse = {
    number: keywordSchema("parse.number"),
    integer: keywordSchema("parse.integer"),
    json: keywordSchema("parse.json"),
    date: keywordSchema("parse.date"),
    url: keywordSchema("parse.url"),
    boolean: keywordSchema("parse.boolean"),
    bigint: keywordSchema("parse.bigint")
  };
  type2.number = Object.assign(makeType({ k: "number" }, [], {}), {
    integer: makeType({ k: "number", int: true }, [], {})
  });
  type2.arrayIndex = makeType({
    k: "refine",
    base: { k: "string" },
    pred: (value) => typeof value === "string" && /^(?:0|[1-9]\d*)$/.test(value),
    expected: "a non-negative integer string"
  }, [], {});
  type2.boolean = makeType({ k: "boolean" }, [], {});
  type2.bigint = makeType({ k: "bigint" }, [], {});
  type2.symbol = makeType({ k: "symbol" }, [], {});
  type2.object = makeType({ k: "anyobject" }, [], {});
  type2.unknown = makeType({ k: "unknown" }, [], {});
  type2.any = type2.unknown;
  type2.never = makeType({ k: "never" }, [], {});
  type2.keywords = {
    number: { integer: type2.number.integer },
    Map: keywordSchema("Map"),
    Set: keywordSchema("Set"),
    RegExp: keywordSchema("RegExp"),
    File: keywordSchema("File"),
    Error: keywordSchema("Error"),
    Function: keywordSchema("Function"),
    Array: {
      liftFrom(definition) {
        const element = parseDef(definition);
        const array = { k: "array", el: element, desc: "an object" };
        return makeType({
          k: "morph",
          input: { k: "union", members: [element, array] },
          fn: (value) => globalThis.Array.isArray(value) ? value : [value],
          out: array
        }, [], {});
      }
    },
    Record(key, value) {
      const keyIR = parseDef(key);
      if (keyIR.k !== "string" && keyIR.k !== "symbol") {
        throw new OmpTypeError("Record key must be assignable to string or symbol");
      }
      const valueIR = parseDef(value);
      const ir = keyIR.k === "symbol" ? { k: "object", props: [], symbolIndex: valueIR, extras: "keep" } : { k: "object", props: [], index: valueIR, extras: "keep" };
      return makeType(ir, [], {});
    },
    Partial(definition) {
      return makeType(setObjectOptionality(parseDef(definition), true, "partial"), [], {});
    },
    Required(definition) {
      return makeType(setObjectOptionality(parseDef(definition), false, "required"), [], {});
    },
    Pick(definition, ...keys) {
      return makeType(selectObjectProps(parseDef(definition), keys, true, "pick"), [], {});
    },
    Omit(definition, ...keys) {
      return makeType(selectObjectProps(parseDef(definition), keys, false, "omit"), [], {});
    },
    Merge(left, right) {
      return makeType(mergeObjectDefinition(parseDef(left), right), [], {});
    },
    object: {
      json: Object.defineProperties(keywordSchema("object.json"), {
        stringify: {
          value: keywordSchema("object.json.stringify"),
          enumerable: true
        }
      })
    },
    unknown: { any: keywordSchema("unknown.any") }
  };
  type2.Date = makeType({ k: "instance", ctor: globalThis.Date, expected: "a Date" }, [], {});
  function instanceOf(ctor) {
    if (typeof ctor !== "function" || ctor.prototype === undefined) {
      throw new OmpTypeError("instanceof operands must be constructors");
    }
    const name = Reflect.get(ctor, "name");
    const expected = ctor.prototype === Error.prototype ? "an Error" : typeof name === "string" && name.length > 0 ? `an instance of ${name}` : "an instance";
    return makeType({ k: "instance", ctor, expected }, [], {});
  }
  type2.instanceOf = instanceOf;
  function unit(value) {
    return makeType({ k: "lit", v: value }, [], {});
  }
  type2.unit = unit;
  function enumerated(...values) {
    const members = values.map((value) => ({ k: "lit", v: value }));
    const ir = members.length === 0 ? { k: "never" } : members.length === 1 ? members[0] : { k: "union", members };
    return makeType(ir, [], {});
  }
  type2.enumerated = enumerated;
  function enumeration(values) {
    return enumerated(...values);
  }
  type2.enumeration = enumeration;
  function valueOf(values) {
    const members = [];
    for (const key in values) {
      if (/^(?:0|[1-9]\d*)$/.test(key))
        continue;
      members.push({ k: "lit", v: values[key] });
    }
    const ir = members.length === 0 ? { k: "never" } : members.length === 1 ? members[0] : { k: "union", members };
    return makeType(ir, [], {});
  }
  type2.valueOf = valueOf;
  type2.match = matchBuilder;
  function define(definition) {
    return definition;
  }
  type2.define = define;
  type2.fn = makeFn();
  type2.declare = () => ({
    type: (definition) => type(definition)
  });
  function scope(aliases, options) {
    return buildScope(aliases, options);
  }
  type2.scope = scope;
  function module(definitions, options) {
    return scope(definitions, options).export();
  }
  type2.module = module;
  function generic(...arguments_) {
    if (arguments_.length === 2 && typeof arguments_[0] === "string" && arguments_[0].trimStart().startsWith("<")) {
      return createRuntimeGeneric(parseGenericParameters(arguments_[0]), arguments_[1]);
    }
    const parameters = arguments_.map((parameter) => {
      if (typeof parameter === "string")
        return { name: parameter.trim() };
      if (Array.isArray(parameter) && typeof parameter[0] === "string") {
        return { name: parameter[0].trim(), constraintDef: parameter[1] };
      }
      throw new OmpTypeError("generic parameters must be names or [name, constraint] pairs");
    });
    validateGenericParameters(parameters);
    return (definition) => createRuntimeGeneric(parameters, definition);
  }
  type2.generic = generic;
  function raw(def) {
    return makeType(parseDef(def), [], {});
  }
  type2.raw = raw;
  function withJsonSchema(schema, json) {
    const internal = schema;
    if (internal.hasDefault || hasMorph(internal.ir) || internal[kSteps].some((step) => step.kind === "pipe")) {
      throw new OmpTypeError("type.withJsonSchema cannot wrap schemas with defaults or output-changing morphs");
    }
    return makeType({
      k: "refine",
      base: { k: "unknown" },
      pred: (value) => {
        const result = schema(value);
        return result instanceof OmpErrors ? result : true;
      },
      expected: schema.expression,
      json: { ...json }
    }, [], {});
  }
  type2.withJsonSchema = withJsonSchema;
})(type ||= {});
Object.assign(type, {
  null: makeType({ k: "null" }, [], {}),
  undefined: makeType({ k: "undefined" }, [], {}),
  true: makeType({ k: "lit", v: true }, [], {}),
  false: makeType({ k: "lit", v: false }, [], {})
});
var MODULE_SCOPE = Symbol("omptype.moduleScope");
function scope(aliases, options) {
  return buildScope(aliases, options);
}
((scope) => {
  function define(definitions) {
    return definitions;
  }
  scope.define = define;
})(scope ||= {});
function isRuntimeModule(value) {
  return typeof value === "object" && value !== null && MODULE_SCOPE in value;
}
function buildScope(aliases, options) {
  const scopeMeta = options?.clone === undefined ? EMPTY_META : { clone: options.clone };
  const withScopeConfig = (ir) => options?.divisor === undefined ? ir : configureSelected(ir, options.divisor, { kind: "divisor" });
  const entries = new Map;
  for (const sourceName in aliases) {
    const isPrivate = sourceName.startsWith("#");
    const visibleName = isPrivate ? sourceName.slice(1) : sourceName;
    const declaration = parseGenericDeclaration(visibleName);
    const external = isRuntimeGeneric(aliases[sourceName]) ? aliases[sourceName] : undefined;
    const name = declaration?.name ?? visibleName;
    if (entries.has(name))
      throw new OmpTypeError(`alias "${name}" is declared as both public and private`);
    entries.set(name, {
      name,
      sourceName,
      private: isPrivate,
      genericParameters: declaration?.parameters ?? external?.[GENERIC_META].parameters,
      definition: aliases[sourceName],
      generic: external,
      materialized: false
    });
  }
  const references = new Map;
  const targets = new Map;
  const scopeValue = {};
  const materialize = (entry) => {
    if (entry.materialized)
      return entry.definition;
    entry.materialized = true;
    if (entry.genericParameters === undefined && typeof entry.definition === "function" && !(IR_BRAND in entry.definition)) {
      entry.definition = Reflect.apply(entry.definition, undefined, []);
    }
    return entry.definition;
  };
  const moduleSchema = (module, parts) => {
    let current = module;
    for (const part of parts) {
      if (!isRuntimeModule(current))
        return;
      const next = current[part];
      if (next === undefined)
        return;
      current = next;
    }
    if (isRuntimeModule(current)) {
      const root = current.root;
      return root !== undefined && !isRuntimeModule(root) ? root : undefined;
    }
    return current;
  };
  const resolve = (path) => {
    const [name, ...parts] = path.split(".");
    const entry = entries.get(name);
    if (entry === undefined || entry.genericParameters !== undefined)
      return;
    const definition = materialize(entry);
    if (isRuntimeModule(definition)) {
      const schema = moduleSchema(definition, parts);
      return schema === undefined ? undefined : embed(schema);
    }
    if (parts.length !== 0)
      return;
    const existing = references.get(name);
    if (existing !== undefined)
      return existing;
    const reference = {
      k: "alias",
      name,
      resolve: () => {
        const target = targets.get(name);
        if (target !== undefined)
          return target;
        const parsed = parseDef(definition, resolve);
        targets.set(name, parsed);
        return parsed;
      }
    };
    references.set(name, reference);
    return reference;
  };
  const genericFor = (entry) => {
    if (entry.generic !== undefined)
      return entry.generic;
    const parameters = entry.genericParameters;
    if (parameters === undefined)
      throw new OmpTypeError(`alias "${entry.name}" is not generic`);
    entry.generic = createRuntimeGeneric(parameters, entry.definition, resolve, false);
    return entry.generic;
  };
  const genericInstantiations = new Map;
  resolve.hasGeneric = (name) => entries.get(name)?.genericParameters !== undefined;
  resolve.generic = (name, arguments_) => {
    const entry = entries.get(name);
    if (entry === undefined || entry.genericParameters === undefined)
      return;
    const key = `${name}<${arguments_.map(expectedOf).join(",")}>`;
    const existing = genericInstantiations.get(key);
    if (existing !== undefined)
      return existing;
    let target;
    const reference = {
      k: "alias",
      name: key,
      resolve: () => {
        target ??= genericFor(entry)[GENERIC_META].instantiateIR(arguments_);
        return target;
      }
    };
    genericInstantiations.set(key, reference);
    target = genericFor(entry)[GENERIC_META].instantiateIR(arguments_);
    return target;
  };
  const bind = (schema) => {
    Reflect.set(schema, "$", scopeValue.current);
    Reflect.set(schema, "resolver", resolve);
    return schema;
  };
  const parseScoped = (definition) => bind(makeType(withScopeConfig(parseDef(definition, resolve)), EMPTY_STEPS, scopeMeta));
  const scopedMatch = createMatchParser({
    parse: (definition) => parseScoped(definition),
    branches: []
  });
  const scoped = Object.assign((definition) => parseScoped(definition), type, {
    fn: makeFn(resolve),
    match: scopedMatch,
    ...naryStatics(resolve)
  });
  const targetFor = (name) => {
    const resolved = resolve(name);
    if (resolved === undefined)
      throw new OmpTypeError(`unknown alias "${name}"`);
    return resolved.k === "alias" ? resolved.resolve() : resolved;
  };
  const schemaFor = (name) => bind(makeType(withScopeConfig(targetFor(name)), EMPTY_STEPS, scopeMeta));
  const bindModule = (names) => {
    const module = {};
    Object.defineProperty(module, MODULE_SCOPE, { value: scopeValue.current });
    for (const name of names) {
      const entry = entries.get(name);
      if (entry === undefined)
        continue;
      if (entry.genericParameters !== undefined) {
        module[name] = genericFor(entry);
        continue;
      }
      const definition = materialize(entry);
      module[name] = isRuntimeModule(definition) ? definition : schemaFor(name);
    }
    return module;
  };
  scopeValue.current = {
    type: scoped,
    match: scopedMatch,
    define(definition) {
      return definition;
    },
    resolve(name) {
      return schemaFor(name);
    },
    import(...names) {
      const selected = names.length === 0 ? [...entries.values()].filter((entry) => !entry.private) : names.map((name) => {
        const entry = entries.get(name);
        if (entry === undefined)
          throw new OmpTypeError(`unknown alias "${name}"`);
        return entry;
      });
      const imported = {};
      for (const entry of selected) {
        imported[`#${entry.sourceName.startsWith("#") ? entry.sourceName.slice(1) : entry.sourceName}`] = entry.genericParameters === undefined ? schemaFor(entry.name) : genericFor(entry);
      }
      return imported;
    },
    export(...names) {
      const selected = names.length === 0 ? [...entries.values()].filter((entry) => !entry.private).map((entry) => entry.name) : names;
      for (const entry of entries.values()) {
        if (entry.genericParameters !== undefined)
          genericFor(entry);
        else if (!isRuntimeModule(materialize(entry)))
          targetFor(entry.name);
      }
      return bindModule(selected);
    },
    get json() {
      const json = {};
      const add = (prefix, module) => {
        for (const name of Object.keys(module)) {
          const value = module[name];
          const path = prefix === "" ? name : `${prefix}.${name}`;
          if (isRuntimeModule(value))
            add(path, value);
          else
            json[path] = Reflect.get(value, "json");
        }
      };
      add("", bindModule([...entries.values()].filter((entry) => !entry.private).map((entry) => entry.name)));
      return json;
    }
  };
  return scopeValue.current;
}
// src/settings.ts
import { findScopedSettings } from "@oh-my-pi/pi-coding-agent/config/settings";
var OAuthSettingsSchema = type({
  "clientId?": "string",
  "clientSecret?": "string",
  "authorizeUrl?": "string",
  "tokenUrl?": "string",
  "revokeUrl?": "string",
  "scopes?": "string[]",
  "redirectPort?": "number.integer",
  "redirectPath?": "string",
  "redirectHost?": "'127.0.0.1' | 'localhost'"
});
var LinearSettingsSchema = type({
  "endpoint?": "string",
  "apiKeyFile?": "string",
  "appCredentialsFile?": "string",
  "defaultConnection?": "string",
  "oauth?": OAuthSettingsSchema
});
var SettingsLayerSchema = type({ "linear?": LinearSettingsSchema });
function linearBlock(layer, source) {
  const checked = SettingsLayerSchema(layer);
  if (checked instanceof OmpErrors) {
    throw new Error(`Invalid linear settings (${source}): ${checked.map((e) => `${e.path.join(".")}: ${e.problem}`).join("; ")}`);
  }
  return checked.linear ?? {};
}
var USER_ONLY = ["endpoint", "apiKeyFile", "appCredentialsFile", "oauth.authorizeUrl", "oauth.tokenUrl", "oauth.revokeUrl"];
function rejectUserOnly(project) {
  const oauth = project.oauth ?? {};
  const set = USER_ONLY.filter((key) => key.startsWith("oauth.") ? oauth[key.slice("oauth.".length)] !== undefined : project[key] !== undefined);
  if (set.length > 0) {
    throw new Error(`Project settings may not set ${set.map((key) => `linear.${key}`).join(", ")}: these decide where credentials are sent. Move them to the user config (<agent dir>/config.yml).`);
  }
}
function readLinearSettings(cwd) {
  const settings = findScopedSettings(cwd);
  if (!settings)
    return { oauth: {} };
  const global = linearBlock(settings.getGlobalSettings(), "global");
  const project = linearBlock(settings.getProjectSettings(), "project");
  rejectUserOnly(project);
  return {
    endpoint: global.endpoint,
    apiKeyFile: global.apiKeyFile,
    appCredentialsFile: global.appCredentialsFile,
    defaultConnection: project.defaultConnection ?? global.defaultConnection,
    oauth: { ...global.oauth, ...project.oauth }
  };
}
function resolveOAuth(settings, env = process.env) {
  const clientId = env.LINEAR_OAUTH_CLIENT_ID || settings.clientId;
  const clientSecret = env.LINEAR_OAUTH_CLIENT_SECRET || settings.clientSecret || null;
  const missing = [];
  if (!clientId)
    missing.push("clientId");
  if (settings.redirectPort === undefined || settings.redirectPort <= 0)
    missing.push("redirectPort");
  if (missing.length > 0 || !clientId || settings.redirectPort === undefined)
    return { missing };
  const cfg = resolveOAuthConfig({
    clientId,
    clientSecret,
    authorizeUrl: settings.authorizeUrl,
    tokenUrl: settings.tokenUrl,
    revokeUrl: settings.revokeUrl,
    scopes: settings.scopes
  });
  if ("missing" in cfg)
    return cfg;
  return { cfg, redirect: { port: settings.redirectPort, path: settings.redirectPath, host: settings.redirectHost } };
}

// src/state.ts
var STATE_ENTRY_TYPE = "linear-state";
function emptyState() {
  return { connectionId: null, activeOperation: null, actor: null };
}
function persistState(pi, state) {
  pi.appendEntry(STATE_ENTRY_TYPE, state);
}
function restoreState(sessionManager) {
  const branch = sessionManager.getBranch();
  for (let index = branch.length - 1;index >= 0; index--) {
    const entry = branch[index];
    if (entry?.type !== "custom" || entry.customType !== STATE_ENTRY_TYPE)
      continue;
    return normalize2(entry.data);
  }
  return emptyState();
}
function normalize2(data) {
  const state = emptyState();
  if (!data || typeof data !== "object")
    return state;
  const raw = data;
  if (typeof raw.connectionId === "string")
    state.connectionId = raw.connectionId;
  if (typeof raw.activeOperation === "string")
    state.activeOperation = raw.activeOperation;
  const actor = raw.actor;
  if (actor && typeof actor === "object" && typeof actor.id === "string" && typeof actor.displayName === "string" && (actor.label === null || typeof actor.label === "string")) {
    const a = actor;
    state.actor = { id: a.id, displayName: a.displayName, label: a.label };
  }
  return state;
}

// src/index.ts
var LINEAR_ENDPOINT = "https://api.linear.app/graphql";
var API_KEY_FILE_CONNECTION = { id: "api-key-file", kind: "api_key", label: "API key file", actor: "user", workspace: null };
var SEARCH_TOOL = "linear_tool_search";
var UTILITY_TOOLS = ["linear_schema_help", "linear_graphql", "linear_connections"];
var UTILITY_SEARCH_TEXT = {
  linear_schema_help: "Schema help for Linear operations and arguments.",
  linear_graphql: "Run a raw custom GraphQL document.",
  linear_connections: "List Linear connections, the selected one and the session author."
};
var ERGONOMIC_SEARCH_TEXT = {
  linear_issue_create: "Create a Linear issue. Aliases: new issue, create ticket.",
  linear_issue_update: "Update a Linear issue: edit, rename.",
  linear_issue_transition: "Transition a Linear issue to another workflow state, done.",
  linear_issue_get: "Get a Linear issue by identifier MNE-940 or UUID.",
  linear_issue_comment_add: "Add a comment to a Linear issue, reply.",
  linear_issue_relation_add: "Add a relation between Linear issues: blocks, related.",
  linear_issue_search: "Search or list Linear issues: assignee me, project, state types, stale issues not updated in N days.",
  linear_issue_link_add: "Attach a URL link (PR, doc) to a Linear issue.",
  linear_project_create: "Create a Linear project.",
  linear_project_update: "Update a Linear project.",
  linear_project_get: "Get a Linear project with milestones.",
  linear_project_status_post: "Post a project status update with health onTrack atRisk offTrack.",
  linear_milestone_create: "Create a Linear project milestone.",
  linear_milestone_update: "Update a Linear project milestone.",
  linear_document_create: "Create a Linear document in a project or issue.",
  linear_document_update: "Update a Linear document title or content.",
  linear_document_get: "Get a Linear document by id, slug or title."
};
function objectSchema(properties, required) {
  return { type: "object", properties, required, additionalProperties: false };
}
function withoutIntent(schema) {
  const properties = schema.properties;
  if (!properties || !("i" in properties))
    return schema;
  const { i: _intent, ...rest } = properties;
  const required = Array.isArray(schema.required) ? schema.required.filter((name) => name !== "i") : undefined;
  return { ...schema, properties: rest, ...required ? { required } : {} };
}
function text2(value, details, isError = false) {
  return { content: [{ type: "text", text: value }], details, isError };
}
var searchIndexCache;
function searchIndex(catalog) {
  if (!searchIndexCache) {
    const docs = [
      ...catalog.map((d) => ({ tool: d.tool, kind: d.kind, root: d.root, text: `${d.description} ${d.argNames.join(" ")}` })),
      ...ergonomicOps.map((op) => ({
        tool: op.name,
        kind: "Ergonomic",
        root: op.name.replace(/^linear_/, ""),
        text: ERGONOMIC_SEARCH_TEXT[op.name] ?? op.description
      })),
      ...UTILITY_TOOLS.map((tool) => ({ tool, kind: "Utility", root: tool.replace(/^linear_/, ""), text: UTILITY_SEARCH_TEXT[tool] }))
    ];
    searchIndexCache = createSearchIndex(docs);
  }
  return searchIndexCache;
}
function oauthFor(cwd) {
  return resolveOAuth(readLinearSettings(cwd).oauth);
}
var OUTCOME_TEXT = {
  not_sent: "no request was sent; retrying is safe",
  rejected: "the server refused the request; nothing was applied",
  unknown: "the request was sent but no trustworthy response arrived",
  completed: "completed"
};
function describeFailure(result, mutation) {
  const lines = [
    `Linear request failed (${result.kind}${result.status !== null ? ` HTTP ${result.status}` : ""}): ${result.message}`,
    `Outcome ${result.outcome}: ${OUTCOME_TEXT[result.outcome]}.`
  ];
  if (mutation && result.outcome === "unknown") {
    lines.push("The mutation outcome is UNKNOWN \u2014 it may already have been applied. Do not repeat it blindly; query Linear to verify first.");
  }
  for (const error of result.errors ?? [])
    lines.push(`- ${error.message}${error.path ? ` at ${JSON.stringify(error.path)}` : ""}`);
  if (result.retryAfterMs !== null)
    lines.push(`Retry after ${result.retryAfterMs}ms.`);
  return lines.join(`
`);
}
function mutationReportedFailure(data, responseKey) {
  if (!data || typeof data !== "object" || !(responseKey in data))
    return false;
  const payload = data[responseKey];
  return !!payload && typeof payload === "object" && "success" in payload && payload.success === false;
}
function describeUnpinned(unpinned) {
  const buckets = Object.keys(unpinned).filter((key) => unpinned[key].length > 0).map((key) => `${key}: ${unpinned[key].join(", ")}`);
  return `Validation unknown: the document uses names the pinned schema does not know (sent anyway; the server decides): ${buckets.join("; ")}`;
}
function renderResult(result, mutationKeys, unpinned = null) {
  if (!result.ok)
    throw new Error(describeFailure(result, mutationKeys.length > 0));
  const failed = mutationKeys.filter((key) => mutationReportedFailure(result.data, key));
  if (failed.length > 0)
    throw new Error(`Linear mutation ${failed.join(", ")} reported success=false`);
  const encoded = encodeOutput(result.data);
  const notes = [];
  if (unpinned)
    notes.push(describeUnpinned(unpinned));
  if (result.partialErrors) {
    notes.push(`Partial errors (data below is incomplete):
${result.partialErrors.map((e) => `- ${e.message}${e.path ? ` at ${JSON.stringify(e.path)}` : ""}`).join(`
`)}`);
  }
  if (result.rateLimit.remaining !== null)
    notes.push(`Rate limit: ${result.rateLimit.remaining} requests remaining`);
  const body = notes.length > 0 ? `${notes.join(`
`)}

${encoded.text}` : encoded.text;
  return text2(body, {
    format: encoded.format,
    shape: encoded.shape,
    bytes: encoded.bytes,
    outcome: result.outcome,
    rateLimit: result.rateLimit,
    partialErrors: result.partialErrors,
    validation: unpinned ? "unknown" : "pinned",
    unpinned
  });
}
function createLinearExtension(options = {}) {
  const catalog = loadCatalog();
  const fetchImpl = options.fetchImpl ?? fetch;
  const activationEnabled = options.activation !== false;
  const attributionEnabled = options.attribution !== false;
  const index = searchIndex(catalog);
  const targets = attributionTargets(getSchema());
  const activatable = new Set([...UTILITY_TOOLS, ...ergonomicOps.map((op) => op.name), ...catalog.map((d) => d.tool)]);
  return (pi) => {
    const store = createCredentialStore(path3.join(options.agentDir ?? getAgentDir(), "linear", "connections.json"));
    let state = emptyState();
    let activationChain = Promise.resolve();
    function resolveConnection(cwd) {
      if (state.connectionId) {
        const connection = store.get(state.connectionId);
        if (!connection) {
          throw new Error(`Selected Linear connection "${state.connectionId}" no longer exists; run /linear-use <id>.`);
        }
        return { connection, source: "session" };
      }
      const settings = readLinearSettings(cwd);
      if (settings.defaultConnection) {
        const connection = store.get(settings.defaultConnection);
        if (!connection) {
          throw new Error(`linear.defaultConnection "${settings.defaultConnection}" is not a stored connection; fix the setting or run /linear-use <id>.`);
        }
        return { connection, source: "default" };
      }
      if (settings.appCredentialsFile) {
        return {
          connection: {
            id: "app-credentials",
            kind: "app_credentials",
            label: "App credentials file",
            actor: "app",
            workspace: null,
            createdAt: new Date().toISOString(),
            secret: readAppCredentialsFile(settings.appCredentialsFile)
          },
          source: "app-file"
        };
      }
      if (settings.apiKeyFile) {
        const apiKey = readApiKeyFile(settings.apiKeyFile);
        return {
          connection: { ...API_KEY_FILE_CONNECTION, createdAt: new Date().toISOString(), secret: { apiKey } },
          source: "file"
        };
      }
      throw new Error("No Linear connection selected. Set linear.appCredentialsFile or linear.apiKeyFile in the OMP settings, or run /linear-login (OAuth) or /linear-key (API key), then /linear-use <id>.");
    }
    function tokenUrlFor(cwd) {
      return readLinearSettings(cwd).oauth.tokenUrl ?? OAUTH_DEFAULTS.tokenUrl;
    }
    function clientFor(connection, cwd) {
      return createLinearClient({
        endpoint: options.endpoint ?? readLinearSettings(cwd).endpoint ?? LINEAR_ENDPOINT,
        fetchImpl,
        getAuthHeaders: async () => {
          if (connection.kind === "app_credentials") {
            return { authorization: `Bearer ${await appAccessToken(connection.secret, tokenUrlFor(cwd), fetchImpl)}` };
          }
          if (connection.kind !== "oauth")
            return authHeadersFor(connection);
          const oauth = oauthFor(cwd);
          if ("missing" in oauth)
            return authHeadersFor(connection);
          return authHeadersFor(await ensureFreshAccessToken(oauth.cfg, store, connection.id, fetchImpl));
        },
        knownSecrets: () => connection.kind === "app_credentials" ? appCredentialsSecrets(connection.secret, cwd) : connectionSecrets(store.get(connection.id) ?? connection, cwd),
        onAuthRejected: connection.kind === "app_credentials" ? (sent) => {
          const token = sent.authorization?.replace(/^Bearer /, "");
          if (token)
            forgetAppAccessToken(connection.secret, tokenUrlFor(cwd), token);
        } : undefined
      });
    }
    function appCredentialsSecrets(credentials, cwd) {
      let token = null;
      try {
        token = cachedAppAccessToken(credentials, tokenUrlFor(cwd));
      } catch {}
      return [credentials.clientSecret, token].filter((value) => !!value);
    }
    function connectionSecrets(connection, cwd) {
      if (connection.kind === "api_key")
        return [connection.secret.apiKey];
      let clientSecret = null;
      try {
        const oauth = oauthFor(cwd);
        if (!("missing" in oauth))
          clientSecret = oauth.cfg.clientSecret;
      } catch {}
      return [connection.secret.accessToken, connection.secret.refreshToken, clientSecret].filter((value) => !!value);
    }
    function openCall(ctx) {
      const author = resolveAuthor(ctx.agent);
      const { connection } = resolveConnection(ctx.cwd);
      return { connection, client: clientFor(connection, ctx.cwd), author, actor: connection.actor };
    }
    function effectiveConnection(cwd) {
      try {
        const { connection, source } = resolveConnection(cwd);
        return { id: connection.id, kind: connection.kind, actor: connection.actor, label: connection.label, source };
      } catch (error) {
        return { error: error instanceof Error ? error.message : String(error) };
      }
    }
    function attributes(call) {
      return call.actor === "app" && attributionEnabled;
    }
    function activate(name) {
      const run = activationChain.then(async () => {
        if (!activatable.has(name)) {
          throw new Error(name === SEARCH_TOOL ? `${name} is always active; nothing to activate` : `Unknown Linear tool "${name}"; use linear_tool_search to find exact names`);
        }
        const replaced = state.activeOperation;
        if (!activationEnabled)
          return { activated: null, replaced };
        await pi.setActiveTools([...new Set([...pi.getActiveTools().filter((tool) => !activatable.has(tool)), name])]);
        state = { ...state, activeOperation: name };
        persistState(pi, state);
        return { activated: name, replaced };
      });
      activationChain = run.catch(() => {
        return;
      });
      return run;
    }
    function select(connectionId) {
      state = { ...state, connectionId };
      persistState(pi, state);
    }
    async function onSessionOpen(ctx) {
      state = restoreState(ctx.sessionManager);
      try {
        state = { ...state, actor: resolveAuthor(ctx.agent) };
      } catch {
        state = { ...state, actor: null };
      }
      if (state.activeOperation && activationEnabled && !pi.getActiveTools().includes(state.activeOperation)) {
        const restored = state.activeOperation;
        await pi.setActiveTools([...new Set([...pi.getActiveTools().filter((tool) => !activatable.has(tool)), restored])]);
      }
    }
    pi.on("session_start", async (_event, ctx) => onSessionOpen(ctx));
    pi.on("session_switch", async (_event, ctx) => onSessionOpen(ctx));
    pi.registerTool({
      name: SEARCH_TOOL,
      label: "Linear tool search",
      description: "Search the private Linear catalog (495 typed operations, ergonomic ops, raw GraphQL, schema help, connections) by natural language; returns ranked candidates only. Pass `activate` with an exact tool name to make that single Linear operation available (it replaces the previously activated one).",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", minLength: 1 },
          limit: { type: "integer", minimum: 1, maximum: 25, default: 5 },
          activate: { type: "string", minLength: 1 }
        },
        anyOf: [{ required: ["query"] }, { required: ["activate"] }],
        additionalProperties: false
      },
      loadMode: "essential",
      approval: "read",
      async execute(_id, params) {
        const { query, limit, activate: toActivate } = params;
        if (!query && !toActivate)
          throw new Error("linear_tool_search needs `query` and/or `activate`");
        const activation = toActivate ? await activate(toActivate) : null;
        const active = new Set(pi.getActiveTools());
        const candidates = query ? search(index, query, limit ?? 5).map((hit) => ({
          tool: hit.tool,
          kind: hit.kind,
          score: Number(hit.score.toFixed(3)),
          summary: hit.summary,
          active: active.has(hit.tool)
        })) : [];
        const lines = [];
        if (toActivate) {
          lines.push(activation?.activated ? `Activated ${toActivate}${activation.replaced ? ` (replaced ${activation.replaced})` : ""}.` : `Activation of ${toActivate} is disabled in this session (activation seam off).`);
        }
        if (query)
          lines.push(encodeOutput({ query, candidates }).text);
        if (!toActivate)
          lines.push("Nothing was activated. Call linear_tool_search again with `activate: <exact tool name>`.");
        return text2(lines.join(`
`), { candidates, activation }, toActivate !== undefined && activation?.activated === null);
      }
    });
    pi.registerTool({
      name: "linear_schema_help",
      label: "Linear schema help",
      description: "Describe any name in the pinned Linear schema: an operation (tool name lq_issue or root field issue) with arguments, return fields and deprecation, or any object, input, interface, union, enum or scalar type. Unknown names get closest matches.",
      parameters: objectSchema({ name: { type: "string", minLength: 1 } }, ["name"]),
      loadMode: "essential",
      defaultInactive: true,
      approval: "read",
      async execute(_id, params) {
        return text2(describe(params.name));
      }
    });
    pi.registerTool({
      name: "linear_graphql",
      label: "Linear GraphQL",
      description: "Execute a raw GraphQL document against Linear with the selected connection. The document is validated against the pinned schema; names the pinned schema does not know are reported as validation=unknown and still sent. Queries need read approval, mutations need write approval. Subscriptions are rejected. With an actor=app connection every mutation that accepts createAsUser is attributed to the subagent author; the main session writes as the application and may not set createAsUser.",
      parameters: objectSchema({
        document: { type: "string", minLength: 1 },
        variables: { type: "object", additionalProperties: true },
        operationName: { type: "string" }
      }, ["document"]),
      loadMode: "essential",
      defaultInactive: true,
      approval: rawApproval,
      async execute(_id, params, signal, _onUpdate, ctx) {
        const { document, variables, operationName } = params;
        const classified = classifyRawDocument(document, operationName);
        const call = openCall(ctx);
        let outbound = { document: classified.document, variables: variables ?? {} };
        if (classified.operation === "mutation" && attributes(call)) {
          const roots = classified.mutationRoots.flatMap((root) => targets.get(root.field) ?? []);
          if (roots.length > 0) {
            outbound = injectCreateAsUser(outbound.document, outbound.variables, roots, call.author.label, operationName);
          }
        }
        const mutationKeys = mutationPayloadRoots(outbound.document, operationName).map((root) => root.alias);
        const result = await call.client.execute(outbound.document, outbound.variables, { signal, operationName });
        return renderResult(result, mutationKeys, classified.validation === "unknown" ? classified.unpinned : null);
      }
    });
    pi.registerTool({
      name: "linear_connections",
      label: "Linear connections",
      description: "List stored Linear connections (no secrets), the selected one and the session author.",
      parameters: objectSchema({}, []),
      loadMode: "essential",
      defaultInactive: true,
      approval: "read",
      async execute(_id, _params, _signal, _onUpdate, ctx) {
        const payload = {
          selected: state.connectionId,
          effective: effectiveConnection(ctx.cwd),
          activeOperation: state.activeOperation,
          author: state.actor,
          connections: store.list()
        };
        return text2(JSON.stringify(payload, null, 0), payload);
      }
    });
    for (const op of ergonomicOps) {
      pi.registerTool({
        name: op.name,
        label: op.name,
        description: op.description,
        parameters: op.parameters,
        loadMode: "essential",
        defaultInactive: true,
        approval: op.tier,
        async execute(_id, params, _signal, _onUpdate, ctx) {
          const call = openCall(ctx);
          const actorCtx = { actor: attributes(call) ? "app" : "user", authorLabel: call.author.label };
          const encoded = encodeOutput(await op.run(call.client, params, actorCtx));
          return text2(encoded.text, {
            format: encoded.format,
            shape: encoded.shape,
            bytes: encoded.bytes
          });
        }
      });
    }
    for (const descriptor of catalog) {
      const approval = typedApproval(descriptor);
      const target = descriptor.kind === "Mutation" ? targets.get(descriptor.root) : undefined;
      pi.registerTool({
        name: descriptor.tool,
        label: `${descriptor.kind}.${descriptor.root}`,
        description: `${descriptor.deprecated ? `[DEPRECATED: ${descriptor.deprecated}] ` : ""}${descriptor.description}`.slice(0, 1000),
        parameters: withoutIntent(descriptor.parameters),
        loadMode: "essential",
        defaultInactive: true,
        approval,
        async execute(_id, params, signal, _onUpdate, ctx) {
          const call = openCall(ctx);
          const args = params;
          const attributed = target && attributes(call) ? attributeTypedArgs(args, target, call.author.label) : args;
          const { document, variables } = composeOperation(descriptor, attributed);
          const result = await call.client.execute(document, variables, { signal });
          return renderResult(result, descriptor.kind === "Mutation" ? [descriptor.root] : []);
        }
      });
    }
    pi.registerCommand("linear-login", {
      description: "Log in to Linear with OAuth (PKCE): /linear-login [user|app] [label]",
      handler: async (args, ctx) => {
        const [first, ...rest] = args.trim().split(/\s+/).filter(Boolean);
        const actor = first === "app" ? "app" : "user";
        const label = (first === "app" || first === "user" ? rest : [first, ...rest]).filter(Boolean).join(" ") || `linear-${actor}`;
        let oauth;
        try {
          oauth = oauthFor(ctx.cwd);
        } catch (error) {
          ctx.ui.notify(`Linear settings are invalid: ${error instanceof Error ? error.message : String(error)}`, "error");
          return;
        }
        if ("missing" in oauth) {
          ctx.ui.notify(`Linear OAuth is not configured (missing: ${oauth.missing.join(", ")}). Register an OAuth application in Linear, then set linear.oauth.clientId and linear.oauth.redirectPort (the loopback port of the registered redirect URI http://127.0.0.1:<port>/callback) in the OMP settings; LINEAR_OAUTH_CLIENT_ID / LINEAR_OAUTH_CLIENT_SECRET override the client credentials. Or use /linear-key.`, "error");
          return;
        }
        let summary;
        try {
          summary = await loginOAuth({
            cfg: oauth.cfg,
            actor,
            label,
            store,
            fetchImpl,
            redirect: oauth.redirect,
            openUrl: options.openUrl ?? (async (url) => ctx.ui.notify(`Open to authorize Linear: ${url}`, "info"))
          });
        } catch (error) {
          ctx.ui.notify(`Linear login failed: ${error instanceof Error ? error.message : String(error)}`, "error");
          return;
        }
        select(summary.id);
        ctx.ui.notify(`Linear connection ${summary.id} (${summary.label}, ${summary.actor}) stored and selected.`, "info");
      }
    });
    pi.registerCommand("linear-key", {
      description: "Store a Linear personal API key: /linear-key [label] (the key is requested in a dialog, never typed inline)",
      handler: async (args, ctx) => {
        const label = args.trim() || "linear-api-key";
        const apiKey = (await ctx.ui.input("Linear API key", "lin_api_..."))?.trim();
        if (!apiKey) {
          ctx.ui.notify("No API key entered; nothing stored.", "warning");
          return;
        }
        const id = `key-${randomUUID2().slice(0, 8)}`;
        await store.transaction((tx) => tx.upsert({
          id,
          kind: "api_key",
          label,
          actor: "user",
          workspace: null,
          createdAt: new Date().toISOString(),
          secret: { apiKey }
        }));
        select(id);
        ctx.ui.notify(`Linear API key stored as ${id} and selected.`, "info");
      }
    });
    pi.registerCommand("linear-use", {
      description: "Select a stored Linear connection for this session: /linear-use <id>",
      getArgumentCompletions: (prefix) => store.list().filter((c) => c.id.startsWith(prefix)).map((c) => ({ value: c.id, label: `${c.id} \u2014 ${c.label} (${c.kind}, ${c.actor})` })),
      handler: async (args, ctx) => {
        const id = args.trim();
        if (!id || !store.get(id)) {
          ctx.ui.notify(`Unknown Linear connection "${id}". Known: ${store.list().map((c) => c.id).join(", ") || "none"}.`, "error");
          return;
        }
        select(id);
        ctx.ui.notify(`Linear connection ${id} selected.`, "info");
      }
    });
    pi.registerCommand("linear-logout", {
      description: "Remove a stored Linear connection (revokes OAuth tokens when possible): /linear-logout [id]",
      handler: async (args, ctx) => {
        const id = args.trim() || state.connectionId;
        const connection = id ? store.get(id) : undefined;
        if (!id || !connection) {
          ctx.ui.notify(`Unknown Linear connection "${id ?? ""}"; nothing removed.`, "error");
          return;
        }
        if (connection.kind === "oauth") {
          const oauth = oauthFor(ctx.cwd);
          if ("missing" in oauth) {
            ctx.ui.notify("OAuth client not configured; token removed locally without revocation.", "warning");
          } else {
            try {
              await revokeToken(oauth.cfg, connection.secret.accessToken, fetchImpl);
            } catch (error) {
              const message = safeMessage(error instanceof Error ? error.message : String(error), connectionSecrets(connection, ctx.cwd));
              ctx.ui.notify(`Token revocation failed (${message}); removing locally.`, "warning");
            }
          }
        }
        const removed = await store.transaction((tx) => tx.remove(id));
        if (state.connectionId === id)
          select(null);
        ctx.ui.notify(removed ? `Linear connection ${id} removed.` : `Linear connection ${id} was already removed.`, "info");
      }
    });
  };
}
var src_default = createLinearExtension();
export {
  LINEAR_ENDPOINT,
  SEARCH_TOOL,
  UTILITY_TOOLS,
  createLinearExtension,
  src_default as default
};
