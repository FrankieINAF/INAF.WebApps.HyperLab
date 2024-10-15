using INAF.Libraries.Net.CommonWebAppModels.Models.Info;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.CommonWebAppModels.Models.SpectraFiles;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.HyperLabCommonModels.Models.SampleData;
using INAF.Libraries.Net.HyperLabCommonModels.Models.SampleData.Containers;
using INAF.Libraries.Net.HyperLabCommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLabCommonModels.Models.WebApp.Responses;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Extensions;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Dynamic;
using INAF.Libraries.Net.HyperLabCommonModels.Values;
using Newtonsoft.Json;
using LinqKit;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class SearchesController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;

        public SearchesController(IServiceProvider serviceProvider,
                                  ILogger<SearchesController> logger,
                                  DbHandlerHyperLabData dbHandlerSLabData) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerSLabData;
        }

        [HttpGet]
        public IActionResult Search()
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            SampleTypeValuesContainerExtended sampleTypeValuesContainerExtended = SampleTypeValuesContainerExtended.Create(sampleTypesHelper.getSampleTypeValuesContainer());
            return View(sampleTypeValuesContainerExtended);
        }

        #region SEARCH COMPLEX
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SearchComplex(ComplexSearchModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchComplex(model.Conditions,
                                                                                             getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }
        #endregion

        #region SEARCH SIMPLE
        [HttpGet]
        public IActionResult SearchSimpleGroupsByMaterial(GenericRequestByParametersModel model)
        {
            if (model.Type == null)
                return new EmptyResult();

            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                            model.Type,
                                                                                                            getUserId());

            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByMineralType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByMineralType(model.Id,
                                                                                                                          getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByOriginType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsByOriginType(model.Id,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleName(GenericRequestByTextModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleName(model.Text,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(retrieveSpectraFilesForGroups(spectraFilesInfo));
            }

            return new EmptyResult();
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleType(GenericRequestByIdModel model)
        {
            IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandlerHyperLabData.searchSimpleGroupsBySampleType(model.Id,
                                                                                                                         getUserId());
            switch (getCallerContext())
            {
                case Enums.CallerContext.Web:
                    return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));

                case Enums.CallerContext.App:
                    return buildJsonContentResult(spectraFilesInfo);
            }

            return new EmptyResult();
        }
        #endregion

        #region DETAILS
        [HttpGet]
        public IActionResult SearchGroupItems(GenericRequestByIdModel model)
        {
            List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(model.Id,
                                                                                                 getUserId());
            if (spectrumInfoModels?.Count > 0)
                return new JsonResult(spectrumInfoModels);
            else
                return new EmptyResult();
        }
        #endregion

        #region SUGGESTIONS
        [HttpGet]
        public async Task<IActionResult> GetMaterialsSuggestions(GenericRequestByTextModel model)
        {
            SuggestionsContainer suggestionsContainer = new SuggestionsContainer();

            List<Task<MaterialsContainer>> tasks = new List<Task<MaterialsContainer>>(2)
            {
                Task.Run(() =>
                {
                    var minerals = dbHandlerHyperLabData.getMinerals(model.Text);
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeMinerals,
                        Materials = minerals.Cast<MaterialBaseModel>(),
                    };
                }),
                Task.Run(() =>
                {
                    var rocks = dbHandlerHyperLabData.getRocks(model.Text);
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeRocks,
                        Materials = rocks,
                    };
                }),
                Task.Run(async () =>
                {
                    var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
                    MaterialsContainer meteorClassesContainer = await searchByMaterialHelper.getMeteorClassesAsync(model.Text);
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeRocks,
                        Materials = meteorClassesContainer.Materials,
                    };
                }),
            };

            var results = await Task.WhenAll(tasks);

            JsonResult? jsonResult = null;
            switch (getCallerContext())
            {
                case Libraries.Net.HyperLabCommonModels.Values.Enums.CallerContext.Web:
                    ExpandoObject jsonObject = buildMineralsSuggestionsJson(results.ToList());
                    jsonResult = new JsonResult(jsonObject);
                    break;
                case Libraries.Net.HyperLabCommonModels.Values.Enums.CallerContext.App:
                    jsonResult = new JsonResult(results);
                    break;
            }

            return jsonResult!;
        }

        [HttpGet]
        public IActionResult GetSampleNameSuggestions(GenericRequestByTextModel model)
        {
            if (model.Text.Length < 3)
                return new EmptyResult();

            List<string>? sampleNames = dbHandlerHyperLabData.getSampleNameSuggestions(model.Text,
                                                                                       getUserId());
            if (sampleNames?.Count > 0)
                return new JsonResult(sampleNames);
            else
                return new EmptyResult();
        }
        #endregion

        #region SEARCHES MANAGEMENT
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteComplexSearch([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandlerHyperLabData.deleteComplexSearchAsync(model.Id,
                                                                 getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearches()
        {
            IEnumerable<ComplexSearchGeneralInfoModel>? savedSearches = dbHandlerHyperLabData.getSavedComplexSearches(getUserId());
            return new JsonResult(savedSearches);
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearchInfo(GenericRequestByIdModel model)
        {
            ComplexSearchDetailedInfoModel? result = dbHandlerHyperLabData.getSavedComplexSearchInfo(model.Id,
                                                                                         getUserId());
            return new JsonResult(result);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveComplexSearch(ComplexSearchSavingModel model)
        {
            GenericValueStringResponseModel result = null;

            var errorResult = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchErrorMessage };

            if (ModelState.IsValid)
            {
                if (string.IsNullOrEmpty(model.Name) || model.Conditions == null)
                    return new JsonResult(errorResult);

                var saveSearchResult = await dbHandlerHyperLabData.saveComplexSearchAsync((int)model.Id,
                                                                              model.Name,
                                                                              model.Conditions,
                                                                              getUserId());

                switch (saveSearchResult.queryResult)
                {
                    case Libraries.Net.HyperLabCommonModels.Values.Enums.QueryResult.Ok:
                        result = new GenericValueStringResponseModel() { IsOk = true, Id = saveSearchResult.id };
                        break;
                    case Libraries.Net.HyperLabCommonModels.Values.Enums.QueryResult.AlreadyExistingItem:
                        result = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchAlreadyExistingMessage };
                        break;
                    case Libraries.Net.HyperLabCommonModels.Values.Enums.QueryResult.Error:
                    case Libraries.Net.HyperLabCommonModels.Values.Enums.QueryResult.ErrorOnInsert:
                    case Libraries.Net.HyperLabCommonModels.Values.Enums.QueryResult.ErrorOnCommit:
                        result = errorResult;
                        break;
                    default:
                        break;
                }
            }
            else
            {
                result = errorResult;
            }

            return new JsonResult(result);
        }
        #endregion

        private ContentResult buildJsonContentResult(object? inputValue)
        {
            string jsonResult = JsonConvert.SerializeObject(inputValue);
            return Content(jsonResult, "application/json");
        }

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
                    suggestionsObject.AddProperty(item.Id.ToString(), item.Name);
                }
                suggestionsContainerObject.AddProperty(material.Name, suggestionsObject);
            }

            return suggestionsContainerObject;
        }

        private IEnumerable<ISpectraGroupInfoModel>? retrieveSpectraFilesForGroups(IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo)
        {
            spectraFilesInfo?.ForEach(spectraGroupInfo =>
            {
                List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(spectraGroupInfo.Id,
                                                                                                     getUserId());
                if (spectrumInfoModels?.Count > 0)
                    spectraGroupInfo.Spectra = spectrumInfoModels;
            });

            return spectraFilesInfo;
        }
    }
}
