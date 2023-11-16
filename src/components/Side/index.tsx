import { defineComponent } from 'vue'
import styles from './index.module.scss'
import { Menu, Submenu, MenuItem } from 'view-ui-plus'
import MenuItems from './components/MenuItems'
import useDirectory from '@/hooks/useDirectory'
import useFileContent from '@/hooks/useFileContent'
import { FileType } from '@/types/file'
const files = import.meta.glob('../../files/**/*')
interface IProps {
  onChangeFile(content: string): void
}
export default defineComponent({
  async setup(props: IProps, { emit }) {
    const { menus } = await useDirectory(files)
    const changeFile = async (file: FileType) => {
      const content = await useFileContent(file)
      emit('changeFile', content)
    }
    const menuItemClick = async (file: FileType) => {
      const content = await useFileContent(file)
      emit('changeFile', content)
    }
    return {
      props,
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
