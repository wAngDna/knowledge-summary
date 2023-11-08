import { defineComponent } from 'vue'
import styles from './index.module.scss'
import { Menu, Submenu, MenuItem } from 'view-ui-plus'
import MenuItems from './components/MenuItems'
import useDirectory from '@/hooks/useDirectory'
import useFileContent from '@/hooks/useFileContent'
import { FileType } from '@/types/file'

const files = import.meta.glob('../../files/**/*')

const props = {
  onChangeFile: {
    type: Function,
    default: () => {}
  }
}
export default defineComponent({
  props: props,
  async setup(props, { emit }) {
    const { menus } = await useDirectory(files)
    console.log(props)
    const changeFile = async (file: FileType) => {
      const { fileRaw } = await useFileContent(file)
      emit('changeFile', fileRaw)
    }
    const menuItemClick = async (file: FileType) => {
      const { fileRaw } = await useFileContent(file)
      emit('changeFile', fileRaw)
    }
    return {
      menus,
      changeFile,
      menuItemClick
    }
  },

  render() {
    return (
      <div class={styles.sideWraper}>
        <Menu width="200">
          {this.menus.map((menu: FileType) => {
            if (menu.children.length > 0) {
              return (
                <Submenu
                  name={menu.id}
                  v-slots={{
                    title: () => <>{menu.name}</>
                  }}
                >
                  <MenuItems
                    onChangeFile={(file: FileType) => this.menuItemClick(file)}
                    menuItem={menu.children}
                  />
                </Submenu>
              )
            } else {
              return (
                <MenuItem onClick={() => this.menuItemClick(menu)} name={menu.name}>
                  {menu.name}
                </MenuItem>
              )
            }
          })}
        </Menu>
      </div>
    )
  }
})
