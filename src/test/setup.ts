import 'fake-indexeddb/auto'

if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock-url'
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {}
}
