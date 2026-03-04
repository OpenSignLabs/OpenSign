import { TEditorBlock, TEditorConfiguration } from "../../editor/core";

type TResult = {
  document: TEditorConfiguration;
  blockId: string;
};

function cloneChildrenIds(
  document: TEditorConfiguration,
  blockIds: string[]
): string[] {
  return blockIds.map((blockId) => {
    const newBlock = cloneBlock(document, blockId);
    const newBlockId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    document[newBlockId] = newBlock;
    return newBlockId;
  });
}

function cloneBlock(
  document: TEditorConfiguration,
  blockId: string
): TEditorBlock {
  const clone = structuredClone(document[blockId]);
  switch (clone.type) {
    case "EmailLayout":
      throw new Error("Cloning EmailLayout blocks is not supported.");
    case "Avatar":
    case "Button":
    case "Divider":
    case "Heading":
    case "Html":
    case "Image":
    case "Spacer":
    case "Text":
      return clone;
    case "Container":
      if (clone.data?.props?.childrenIds) {
        clone.data.props.childrenIds = cloneChildrenIds(
          document,
          clone.data.props.childrenIds
        );
      }
      return clone;
    case "ColumnsContainer":
      if (clone.data?.props?.columns) {
        clone.data.props.columns[0].childrenIds = cloneChildrenIds(
          document,
          clone.data.props.columns[0].childrenIds
        );
        clone.data.props.columns[1].childrenIds = cloneChildrenIds(
          document,
          clone.data.props.columns[1].childrenIds
        );
        clone.data.props.columns[2].childrenIds = cloneChildrenIds(
          document,
          clone.data.props.columns[2].childrenIds
        );
      }
      return clone;
  }
}

export default function cloneDocumentBlock(
  originalDocument: TEditorConfiguration,
  originalBlockId: string
): TResult {
  const document = { ...originalDocument };
  const blockId = `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  document[blockId] = cloneBlock(document, originalBlockId);
  return {
    document,
    blockId
  };
}
