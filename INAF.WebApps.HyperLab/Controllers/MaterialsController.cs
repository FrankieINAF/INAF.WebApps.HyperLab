using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Responses;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.SampleData.Containers;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Dynamic;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class MaterialsController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public MaterialsController(IServiceProvider serviceProvider,
                                   ILogger<MaterialsController> logger,
                                   DbHandlerHyperLabData dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabUsers;
        }

        #region VIEWS
        [HttpGet]
        public IActionResult GetMineralDetailsView(GenericRequestByIdModel model)
        {
            var mineralModel = dbHandlerHyperLabData.getMineralDetails(model.Id);
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
                mineralModel = dbHandlerHyperLabData.getMineralDetails(model.Id);

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
        public async Task<IActionResult> GetMaterialsSuggestions(GenericRequestByTextModel model)
        {
            SuggestionsContainer suggestionsContainer = new SuggestionsContainer();

            List<Task<MaterialsContainer?>> tasks = new List<Task<MaterialsContainer?>>(2)
            {
                Task.Run(() =>
                {
                    var minerals = dbHandlerHyperLabData.getMinerals(model.Text);
                    if (minerals == null)
                        return null;
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeMinerals,
                        Materials = minerals.Cast<MaterialBaseModel>(),
                    };
                }),
                Task.Run(() =>
                {
                    var rocks = dbHandlerHyperLabData.getRocks(model.Text);
                    if (rocks == null)
                        return null;
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeRocks,
                        Materials = rocks,
                    };
                }),
                Task.Run(() =>
                {
                    var meteoriteClasses = dbHandlerHyperLabData.getMeteoriteClasses(model.Text);
                    if (meteoriteClasses == null)
                        return null;
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeRocks,
                        Materials = meteoriteClasses,
                    };
                }),
            };

            var results = await Task.WhenAll(tasks);

            JsonResult? jsonResult = null;
            switch (getCallerContext())
            {
                case Libraries.Net.HyperLab.CommonModels.Values.Enums.CallerContext.Web:
                    ExpandoObject jsonObject = buildMineralsSuggestionsJson(results.ToList());
                    jsonResult = new JsonResult(jsonObject);
                    break;
                case Libraries.Net.HyperLab.CommonModels.Values.Enums.CallerContext.App:
                    jsonResult = new JsonResult(results);
                    break;
            }

            return jsonResult!;
        }

        [HttpGet]
        public IActionResult GetMeteoriteClasses(GenericRequestByTextModel model)
        {
            return new JsonResult(dbHandlerHyperLabData.getMeteoriteClasses(model.Text));
        }

        [HttpGet]
        public IActionResult GetMinerals(GenericRequestByTextModel model)
        {
            return new JsonResult(dbHandlerHyperLabData.getMinerals(model.Text));
        }

        [HttpGet]
        public IActionResult GetMineralsList()
        {
            return new JsonResult(dbHandlerHyperLabData.getMineralsList());
        }

        [HttpGet]
        public IActionResult GetRocks(string Text)
        {
            return new JsonResult(dbHandlerHyperLabData.getRocks(Text));
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
            bool isOk = await dbHandlerHyperLabData.deleteMineralAsync(model.Id,
                                                                       getUserId());
            return new JsonResult(new GenericValueStringResponseModel() { IsOk = isOk, Id = model.Id });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpsertMineral([FromForm] MaterialModel materialModel)
        {
            if (materialModel == null || string.IsNullOrEmpty(materialModel.Name))
                return new BadRequestObjectResult(getUpsertErrorStatusResponseModel());

            if (ModelState.IsValid)
            {
                (bool isOk, int id) result = await dbHandlerHyperLabData.upsertMineralDataSimpleAsync(materialModel.Id,
                                                                                                      materialModel.Name,
                                                                                                      materialModel.Formula);
                return new JsonResult(new GenericMixedValuesResponseModel(result.isOk, result.id, materialModel.Name));
            }

            logErrorMessage(ModelState.Values);
            return new BadRequestObjectResult(getUpsertErrorStatusResponseModel());
        }
        #endregion

        private ExpandoObject buildMineralsSuggestionsJson(List<MaterialsContainer> materialsContainers)
        {
            ExpandoObject suggestionsContainerObject = new ExpandoObject();
            foreach (var material in materialsContainers)
            {
                if (material.Materials == null)
                    continue;

                ExpandoObject suggestionsObject = new ExpandoObject();
                foreach (var item in material.Materials)
                {
                    suggestionsObject.AddProperty($"{material.Name}_{item.Id.ToString()}", item.Name!);
                }
                suggestionsContainerObject.AddProperty(material.Name!, suggestionsObject);
            }

            return suggestionsContainerObject;
        }
    }
}
