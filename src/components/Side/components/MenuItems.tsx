import { defineComponent } from 'vue'
import { Submenu, MenuItem } from 'view-ui-plus'
import { FileType } from '@/types/file'
const props = {
  onChangeFile: {
    type: Function,
    default: () => {}
  },
  menuItem: {
    type: Array,
    default: () => []
  }
}
const ComponentName = defineComponent({
  props: props,
  setup(props, { emit }) {
    const menuItemClick = (file: FileType) => {
      emit('changeFile', file)
    }
    return {
      menuItem: props.menuItem,
      menuItemClick
    }
  },
  render() {
    const { menuItem } = this
    return (
      <>
        {(menuItem || []).map((item: any) => {
          if (item.children.length > 0) {
            return (
              <Submenu
                name={item.id}
                v-slots={{
                  title: () => <>{item.name}</>
                }}
              >
                <ComponentName
                  onChangeFile={(file: FileType) => this.menuItemClick(file)}
                  menuItem={item.children}
                />
              </Submenu>
            )
          } else {
            return (
              <MenuItem onClick={() => this.menuItemClick(item)} name={item.name}>
                {item.name}
              </MenuItem>
            )
          }
        })}
      </>
    )
  }
})
export default ComponentName
