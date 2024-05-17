using INAF.Libraries.DB.Net.HyperLabUsers;
using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Menu;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class MenuHelper
    {
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public MenuHelper(DbHandlerHyperLabUsers dbHandlerHyperLabUsers)
        {
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        public Menu GetMenu(HttpContext httpContext)
        {
            var menu = new Menu();

            List<MenuItem> menuItems = dbHandlerHyperLabUsers.getMenu(httpContext.GetUserId());
            foreach (var menuItem in menuItems)
            {
                if (!string.IsNullOrEmpty(menuItem.LinkText))
                {
                    (string controllerName, string actionName) values = getAction(menuItem);
                    menuItem.ControllerName = values.controllerName;
                    menuItem.ActionName = values.actionName;
                }
            }

            menu.Items = menuItems;

            return menu;
        }

        public List<MenuItem> GetItemSubMenu(HttpContext httpContext, int parentId)
        {
            List<MenuItem> subMenuItems = dbHandlerHyperLabUsers.getItemSubMenu(httpContext.GetUserId(),
                                                                   parentId);
            foreach (var menuItem in subMenuItems)
            {
                if (!string.IsNullOrEmpty(menuItem.LinkText))
                {
                    (string controllerName, string actionName) values = getAction(menuItem);
                    menuItem.ControllerName = values.controllerName;
                    menuItem.ActionName = values.actionName;
                }
            }

            return subMenuItems;
        }

        private (string controllerName, string actionName) getAction(MenuItem menuItem)
        {
            string controllerName = null;
            string actionName = null;

            string[] tmp = menuItem.LinkText.Split('/');
            controllerName = tmp[1];
            actionName = tmp[2];

            return (controllerName, actionName);
        }
    }
}
