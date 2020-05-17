function decompose(n) {
  return decomposeImpl(n*n, true, []);
}


function decomposeImpl(sum, start, result) {
  if (sum === 0) {
    return true;
  }
  
  var upperBound = parseInt(Math.sqrt(sum));
  
  if (start) {
    upperBound--;
  }
  
  for (var i = upperBound; i > 0; i--) {
    var goodPath = decomposeImpl(sum - i*i, false, result);
    if (goodPath) {
      result.push(i);
    } else {
      return false;
    }
    
  }
  
  return start ? result : false;
}

console.log(decompose(3));
