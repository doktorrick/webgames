function findMidRowDynamic(fromRow, toRow) {
    if (fromRow < toRow) {
      const result = fromRow + Math.abs(fromRow - toRow) / 2;
      return result;
    }
    if (fromRow > toRow) {
      const result = Math.abs(fromRow - Math.abs(fromRow - toRow) / 2);
      return result;
    }
  }
  
  function findMidColDynamic(fromCol, toCol) {
    if (fromCol < toCol) {
      const result = Math.abs(fromCol + Math.abs(fromCol - toCol) / 2);
      return result;
    }
    if (fromCol > toCol) {
      const result = Math.abs(fromCol - Math.abs(fromCol - toCol) / 2);
      return result;
    }
  }
  
  function findCaptureRowDynamic(fromRow, toRow) {
    if (fromRow < toRow) {
      const result = fromRow + Math.abs(fromRow - toRow) / 2;
      return result;
    }
    if (fromRow > toRow) {
      const result = Math.abs(fromRow - Math.abs(fromRow - toRow) / 2);
      return result;
    }
  }
  
  function findCaptureColDynamic(fromCol, toCol) {
    if (fromCol < toCol) {
      const result = toCol - 1;
      return result;
    }
    if (fromCol > toCol) {
      const result = toCol + 1;
      return result;
    }
  }