export default function ({ Plugin, types: t }) {
  function addDisplayName(id, call) {
    var props = call.arguments[0].properties;
    var safe = true;

    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var key = t.toComputedKey(prop);
      if (t.isLiteral(key, { value: "displayName" })) {
        safe = false;
        break;
      }
    }

    if (safe) {
      props.unshift(t.property("init", t.identifier("displayName"), t.literal(id)));
    }
  }
  
  return new Plugin("react-display-name", {
    visitor: {
      ExportDefaultDeclaration(node, parent, scope, file) {
        if (react.isCreateClass(node.declaration)) {
          addDisplayName(file.opts.basename, node.declaration);
        }
      },
      
      "AssignmentExpression|Property|VariableDeclarator"(node) {
        var left, right;

        if (t.isAssignmentExpression(node)) {
          left = node.left;
          right = node.right;
        } else if (t.isProperty(node)) {
          left = node.key;
          right = node.value;
        } else if (t.isVariableDeclarator(node)) {
          left = node.id;
          right = node.init;
        }

        if (t.isMemberExpression(left)) {
          left = left.property;
        }

        if (t.isIdentifier(left) && react.isCreateClass(right)) {
          addDisplayName(left.name, right);
        }
      }
    }
  });
}
