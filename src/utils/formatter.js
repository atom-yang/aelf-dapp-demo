export const centerEllipsis = input => input.replace(input.slice(10, 36), '...');

export const formatToken = value => value.toLocaleString('zh', {
  minimumFractionDigits: 8
});
