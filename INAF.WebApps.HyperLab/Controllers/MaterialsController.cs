using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.SampleData;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class MaterialsController : BaseController
    {
        public MaterialsController(IServiceProvider serviceProvider,
                                  DbHandler dbHandler,
                                  ILogger<BaseController> logger) : base(serviceProvider, dbHandler, logger)
        { }

        #region VIEWS
        [HttpGet]
        public IActionResult GetMineralDetailsView(GenericRequestByIdModel model)
        {
            var mineralModel = dbHandler.getMineralDetails(model.Id);
            if (mineralModel != null)
                return PartialView("Partials/_MineralDetails", mineralModel);
            else
                return new EmptyResult();
        }

        [HttpGet]
        public IActionResult UpsertMineralView(GenericRequestByIdModel? model)
        {
            var mineralModel = new MineralModel();

            if (model?.Id != null && model?.Id > 0)
                mineralModel = dbHandler.getMineralDetails(model.Id);

            return PartialView("Partials/_UpsertMineral", mineralModel);
        }

        [HttpGet]
        public IActionResult UpsertMinerals()
        {
            return PartialView();
        }
        #endregion

        #region GET
        [HttpGet]
        public IActionResult GetMinerals(GenericRequestByTextModel model)
        {
            return new JsonResult(dbHandler.getMinerals(model.Text));
        }

        [HttpGet]
        public IActionResult GetMineralsList()
        {
            return new JsonResult(dbHandler.getMineralsList());
        }

        [HttpGet]
        public IActionResult GetRocks(string Text)
        {
            return new JsonResult(dbHandler.getRocks(Text));
        }

        [HttpGet]
        public IActionResult GetSampleDataValues()
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            var sampleDataValuesContainer = sampleTypesHelper.getSampleTypeValuesContainer();

            return new JsonResult(sampleDataValuesContainer);
        }
        #endregion

        #region POST
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteMineral([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandler.deleteMineralAsync(model.Id,
                                                           getUserId());
            return new JsonResult(new GenericValueStringResponseModel() { IsOk = isOk, Id = model.Id });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpsertMineral([FromForm] MaterialModel materialModel)
        {
            if (ModelState.IsValid)
            {
                (bool isOk, int id) result = await dbHandler.upsertMineralDataSimpleAsync(materialModel.Id,
                                                                                          materialModel.Name,
                                                                                          materialModel.Formula);
                return new JsonResult(new GenericValueStringResponseModel() { IsOk = result.isOk, Id = result.id, Value = materialModel.Name });
            }

            logErrorMessage(ModelState.Values);
            return new BadRequestObjectResult(getUpsertErrorStatusResponseModel());
        }
        #endregion
    }
}
