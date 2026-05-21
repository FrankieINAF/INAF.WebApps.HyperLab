using INAF.Libraries.Net.CommonResources;
using INAF.Libraries.Net.CommonWebAppHelpers.Helpers;
using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Models.WebApp.Users;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public partial class UsersController : BaseController
    {
        private readonly IWebHostEnvironment webHostEnvironment;
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly AuthorizationHelper authorizationHelper;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public UsersController(IServiceProvider serviceProvider,
                               ILogger<UsersController> logger,
                               IWebHostEnvironment webHostEnvironment,
                               DbHandlerHyperLabData dbHandlerHyperLabData,
                               DbHandlerHyperLabUsers dbHandlerHyperLabUsers,
                               AuthorizationHelper authorizationHelper) : base(serviceProvider, logger)
        {
            this.webHostEnvironment = webHostEnvironment;
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
            this.authorizationHelper = authorizationHelper;
        }

        #region VIEWS
        [HttpGet]
        public IActionResult GetUserDetailsView(GenericRequestByIdModel model)
        {
            //var userModel = dbHandlerHyperLabUsers.getUserDetails(model.Id,
            //                                                      getCallerContext());
            //if (userModel != null)
            //    return PartialView("Partials/_UserDetails", userModel);
            //else
            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult UpsertUser()
        {
            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult UsersList(WebBaseModel? statusResponseModel = null)
        {
            if (statusResponseModel == null)
                statusResponseModel = getOkStatusResponseModel();
            return PartialView(statusResponseModel);
        }
        #endregion

        #region GET
        [HttpGet]
        public async Task<IActionResult> CheckUser(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text))
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            GenericValueIntResponseModel? response = await authorizationHelper.getLoginFromUserNameAsync(model.Text);
            if (response != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = response.Value });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        [HttpGet]
        public async Task<IActionResult> GetUserDetailsSimple()
        {
            UserSimpleModel? user = await authorizationHelper.getUserDetailsSimpleAsync(await getUserIdAsync());
            if (user != null)
                return new JsonResult(user);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public async Task<IActionResult> GetUserPermissions()
        {
            List<PermissionModel>? permissions = dbHandlerHyperLabUsers.getUserPermissions(await getUserIdAsync(),
                                                                                           getCallerContext());
            if (permissions?.Count > 0)
                return new JsonResult(permissions);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetUsersList()
        {
            //var users = dbHandlerHyperLabUsers.getUsers();
            //if (users.Any())
            //    return new JsonResult(users);
            //else
            return new EmptyResult();
        }
        #endregion

        #region POST    
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser([FromBody] GenericRequestByIdModel model)
        {
            int operationUserId = await getUserIdAsync();
            if (model.Id == operationUserId)
            {
                return new BadRequestObjectResult(new GenericValueStringResponseModel() { IsOk = false, ExMsg = Users.SelfDeletingErrorMessage });
            }
            else
            {
                bool isOk = await dbHandlerHyperLabUsers.deleteUserAsync(model.Id,
                                                            operationUserId);
                return new JsonResult(new GenericValueStringResponseModel() { IsOk = isOk });
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult EditUser([FromForm] GenericRequestByIdModel model)
        {
            //var usersFactory = serviceProvider.GetRequiredService<UsersFactory>();
            //return PartialView("UpsertUser", usersFactory.getUserForUpdate(model.Id));
            return new EmptyResult();
        }
        #endregion

        //#region checks
        //[HttpPost]
        //public IActionResult CheckIsUserAllowed([FromBody] CheckIsUserExistantModel model)
        //{
        //    /* avoid raising issue when person is in edit mode */
        //    try
        //    {
        //        string[] fields = new[] { model.Name, model.NameForCheck, model.LastName, model.LastNameForCheck, model.Email, model.EmailForCheck };
        //        (bool isEditMode, string exMsg) isRemoteCheckInEditModeResult = isRemoteCheckInEditMode(fields);
        //        if (isRemoteCheckInEditModeResult.isEditMode)
        //            return Json(true);
        //    }
        //    catch (Exception)
        //    {
        //        logger.LogError(Users.CheckIsUserExistantErrorMessage);
        //        return new BadRequestObjectResult(Users.CheckIsUserExistantErrorMessage);
        //    }

        //    if (!dbHandlerHyperLabUsers.isUserExistant(model.Name, model.LastName, model.Email))
        //        return Json(true);
        //    else
        //        return Json(false);
        //}
        //#endregion
    }
}
