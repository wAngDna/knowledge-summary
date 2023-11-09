// import useFileContent from '@/hooks/useFileContent'
export default async function useDirectory(files: any) {
  const listToTree = (arr: any[], rootValue: String) => {
    const tree: any[] = []
    arr.forEach((item) => {
      if (item.parentId === rootValue) {
        const children = listToTree(arr, item.name)
        item.children = children
        if (children.length) {
          item.type = 'submenu'
        } else {
          item.type = 'menu'
        }
        tree.push(item)
      }
    })
    return tree
  }
  const dirArr: any[] = []
  const map: any = {}
  for (const key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      const fileSplitArr = key.split('/')
      const filesArr: any[] = []
      fileSplitArr.forEach((i, index) => {
        if (index > 0) {
          filesArr.push(i)
        }
      })
      for (let i = filesArr.length - 1; i >= 0; i--) {
        if (i > 1) {
          if (!map[filesArr[i]]) {
            map[filesArr[i]] = 1
            dirArr.push({
              id: filesArr[i],
              parentId: filesArr[i - 1],
              name: filesArr[i],
              fileUrl: await files[key]()
            })
          }
        }
      }
    }
  }
  const menus: any = listToTree(dirArr, 'files')
  return { menus }
}
