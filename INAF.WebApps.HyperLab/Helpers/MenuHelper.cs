using INAF.Libraries.Net.CommonWebAppHelpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Menu;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Controllers;
using INAF.WebApps.HyperLab.Extensions;

namespace INAF.WebApps.HyperLab.Helpers
{
    public sealed class MenuHelper
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public MenuHelper(DbHandlerHyperLabData dbHandlerHyperLabData,
                          DbHandlerHyperLabUsers dbHandlerHyperLabUsers)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        public Menu? GetMenu(HttpContext httpContext)
        {
            var menu = new Menu();

            List<MenuItem>? menuItems = dbHandlerHyperLabUsers.getMenuItemsForWeb(httpContext.GetUserId());

            if (menuItems == null || menuItems.Count == 0)
                return null;

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

            /* add menu-item for shares if any */
            bool isAnySharedSpectraByMe = dbHandlerHyperLabData.isAnySharedSpectraByOwnerUser(httpContext.GetUserId());
            bool isAnySharedSpectraWithMe = dbHandlerHyperLabData.isAnySharedSpectraForSubjectUser(httpContext.GetUserId());

            if (isAnySharedSpectraByMe || isAnySharedSpectraWithMe)
            {
                MenuItem menuItem = new MenuItem()
                {
                    Id = -1,
                    PageName = "Shares",
                    Label = Resources.SharedStuff.SharedStuffPageTitle,
                    Icon = "mif-shareable",
                    LinkText = $"/{GenericHelper.GetControllerName(nameof(SpectraManagerController))}/{nameof(SpectraManagerController.SharedStuff)}",
                    ParentId = 0
                };
                (string controllerName, string actionName) values = getAction(menuItem);
                menuItem.ControllerName = values.controllerName;
                menuItem.ActionName = values.actionName;
                menu.Items.Add(menuItem);
            }

            return menu;
        }

        public List<MenuItem>? GetItemSubMenu(HttpContext httpContext, int parentId)
        {
            List<MenuItem>? subMenuItems = dbHandlerHyperLabUsers.getMenuItemsForWeb(httpContext.GetUserId());

            //List<MenuItem>? subMenuItems = dbHandlerHyperLabUsers.getItemSubMenu(httpContext.GetUserId(),
            //                                                                     httpContext.GetPermissionContext(),
            //                                                                     parentId);

            if (subMenuItems == null || subMenuItems.Count == 0)
                return null;

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
            if (string.IsNullOrEmpty(menuItem.LinkText))
                return (string.Empty, string.Empty);

            string? controllerName = null;
            string? actionName = null;

            string[] tmp = menuItem.LinkText.Split('/');
            controllerName = tmp[1];
            actionName = tmp[2];

            return (controllerName, actionName);
        }
    }
}
