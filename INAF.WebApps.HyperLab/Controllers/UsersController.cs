using INAF.Libraries.Net.CommonWebAppModels.Models.Account;
using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.CommonWebAppModels.Models.Users;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers.Factories;
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
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;
        private readonly UsersFactory usersFactory;

        public UsersController(IServiceProvider serviceProvider,
                               ILogger<UsersController> logger,
                               IWebHostEnvironment webHostEnvironment,
                               DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.webHostEnvironment = webHostEnvironment;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
            usersFactory = serviceProvider.GetRequiredService<UsersFactory>();
        }

        #region VIEWS
        [HttpGet]
        public IActionResult GetUserDetailsView(GenericRequestByIdModel model)
        {
            var userModel = dbHandlerHyperLabUsers.getUserDetails(model.Id,
                                                                  getCallerContext());
            if (userModel != null)
                return PartialView("Partials/_UserDetails", userModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult UpsertUser()
        {
            return PartialView(usersFactory.createUserForInsert());
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
        public IActionResult CheckUser(GenericRequestByTextModel model)
        {
            if (string.IsNullOrEmpty(model.Text))
                return new JsonResult(GenericResponseModel.CreateErrorResponse());

            LoginModel? loginModel = dbHandlerHyperLabUsers.getLoginFromUserName(model.Text);
            if (loginModel != null)
                return new JsonResult(new GenericResponseModel() { IsOk = true, ResponseObject = loginModel.Id });
            else
                return new JsonResult(GenericResponseModel.CreateErrorResponse());
        }

        //[HttpGet]
        //public IActionResult GetMenu()
        //{
        //    List<MenuItem>? menuItems = dbHandlerHyperLabUsers.getMenuItems(getUserId(),
        //                                                                    getCallerContext());
        //    if (menuItems?.Count > 0)
        //        return new JsonResult(menuItems);
        //    else
        //        return new EmptyResult();
        //}

        [HttpGet]
        public IActionResult GetUserDetailsSimple()
        {
            Libraries.Net.HyperLab.CommonModels.Models.WebApp.Users.UserSimpleModel user = dbHandlerHyperLabUsers.getUserDetailsSimple(getUserId());
            if (user != null)
                return new JsonResult(user);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetUserPermissions()
        {
            List<PermissionModel>? permissions = dbHandlerHyperLabUsers.getUserPermissions(getUserId(),
                                                                                           getCallerContext());
            if (permissions?.Count > 0)
                return new JsonResult(permissions);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult GetUsersList()
        {
            var users = dbHandlerHyperLabUsers.getUsers();
            if (users.Any())
                return new JsonResult(users);
            else
                return new EmptyResult();
        }
        #endregion

        #region POST    
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser([FromBody] GenericRequestByIdModel model)
        {
            int operationUserId = getUserId();
            if (model.Id == operationUserId)
            {
                return new BadRequestObjectResult(new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Users.SelfDeletingErrorMessage });
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
            var usersFactory = serviceProvider.GetRequiredService<UsersFactory>();
            return PartialView("UpsertUser", usersFactory.getUserForUpdate(model.Id));
        }

        [HttpPost]
        [Obsolete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpsertUser([FromForm] UserModel model)
        {
            clearErrorsForKey($"{nameof(model.Contacts)}[0].{nameof(ContactModel.Name)}");
            if (model.OperationType == Libraries.Net.CommonWebAppModels.Values.Enums.OperationType.Update)
            {
                clearErrorsForKey($"{nameof(model.Login)}.{nameof(LoginModel.Password)}");
                clearErrorsForKey($"{nameof(model.Login)}.{nameof(LoginModel.ConfirmPassword)}");
            }

            if (ModelState.IsValid)
            {
                var email = model.Contacts.FirstOrDefault(x => x.ContactType == INAF.Libraries.Net.CommonWebAppModels.Values.Enums.ContactType.Email);

                /* user-name overwritten by 1st part of email */
                string[] temp = email.Value.Split('@');
                string userName = temp[0];

                if (await dbHandlerHyperLabUsers.upsertUserProcedureAsync(model.Id,
                                                                          model.Name,
                                                                          model.LastName,
                                                                          userName,
                                                                          email.Value,
                                                                          getEncrypted(model.Login.Password),
                                                                          string.Empty,
                                                                          DateTime.MaxValue,
                                                                          model.RoleId,
                                                                          HttpContext.GetUserId()))
                {
                    return new OkObjectResult(getOkStatusResponseModel());
                }
            }

            logErrorMessage(ModelState.Values);
            var modelForError = usersFactory.createUserForInsert();
            modelForError.ErrorMessage = Resources.Users.UpsertUserModelStateNotValidMessage;
            return PartialView(modelForError);
        }
        #endregion

        #region checks
        [HttpPost]
        public IActionResult CheckIsUserAllowed([FromBody] CheckIsUserExistantModel model)
        {
            /* avoid raising issue when person is in edit mode */
            try
            {
                string[] fields = new[] { model.Name, model.NameForCheck, model.LastName, model.LastNameForCheck, model.Email, model.EmailForCheck };
                (bool isEditMode, string exMsg) isRemoteCheckInEditModeResult = isRemoteCheckInEditMode(fields);
                if (isRemoteCheckInEditModeResult.isEditMode)
                    return Json(true);
            }
            catch (Exception)
            {
                logger.LogError(Resources.Users.CheckIsUserExistantErrorMessage);
                return new BadRequestObjectResult(Resources.Users.CheckIsUserExistantErrorMessage);
            }

            if (!dbHandlerHyperLabUsers.isUserExistant(model.Name, model.LastName, model.Email))
                return Json(true);
            else
                return Json(false);
        }
        #endregion
    }
}
