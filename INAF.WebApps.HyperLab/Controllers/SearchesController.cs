using INAF.Libraries.Net.CommonWebAppModels.Models.Info;
using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches;
using INAF.Libraries.Net.CommonWebAppModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.CommonWebAppModels.Models.SpectraFiles;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.SampleData;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.SampleData.Containers;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.Searches;
using INAF.Libraries.NetStandard.HyperLabCommonModels.Models.WebApp.Responses;
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
    public class SearchesController : BaseController
    {
        public SearchesController(IServiceProvider serviceProvider,
                                  DbHandler dbHandler,
                                  ILogger<BaseController> logger) : base(serviceProvider, dbHandler, logger)
        { }

        [HttpGet]
        public IActionResult Search()
        {
            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            SampleTypeValuesContainerExtended sampleTypeValuesContainerExtended = SampleTypeValuesContainerExtended.Create(sampleTypesHelper.getSampleTypeValuesContainer());
            return View(sampleTypeValuesContainerExtended);
        }

        
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SearchComplex(ComplexSearchModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandler.searchComplex(model.Conditions,
                                                                                     getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }

        #region SEARCH SIMPLE
        [HttpGet]
        public IActionResult SearchSimpleGroupsByMaterial(GenericRequestByParametersModel model)
        {
            var searchByMaterialHelper = serviceProvider.GetRequiredService<SearchByMaterialHelper>();
            List<ISpectraGroupInfoModel>? spectraFilesInfo = searchByMaterialHelper.searchByMaterial(model.Id,
                                                                                                     model.Type,
                                                                                                     getUserId());

            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByMineralType(GenericRequestByIdModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandler.searchSimpleGroupsByMineralType(model.Id,
                                                                                                       getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsByOriginType(GenericRequestByIdModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandler.searchSimpleGroupsByOriginType(model.Id,
                                                                                                      getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleName(GenericRequestByTextModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandler.searchSimpleGroupsBySampleName(model.Text,
                                                                                                      getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }

        [HttpGet]
        public IActionResult SearchSimpleGroupsBySampleType(GenericRequestByIdModel model)
        {
            List<ISpectraGroupInfoModel>? spectraFilesInfo = dbHandler.searchSimpleGroupsBySampleType(model.Id,
                                                                                                      getUserId());
            return PartialView("Partials/_SearchResults", new SimpleSearchResultsContainer(spectraFilesInfo));
        }
        #endregion

        #region DETAILS
        [HttpGet]
        public IActionResult SearchGroupItems(GenericRequestByIdModel model)
        {
            List<SpectrumInfoModel>? spectrumInfoModels = dbHandler.searchGroupItems(model.Id,
                                                                                     getUserId());
            if (spectrumInfoModels?.Count > 0)
                return new JsonResult(spectrumInfoModels);
            else
                return new EmptyResult();
        }
        #endregion

        #region SUGGESTIONS
        [HttpGet]
        public async Task<IActionResult> GetMineralsSuggestions(GenericRequestByTextModel model)
        {
            SuggestionsContainer suggestionsContainer = new SuggestionsContainer();

            List<Task<MaterialsContainer>> tasks = new List<Task<MaterialsContainer>>(2)
            {
                Task.Run(() =>
                {
                    var minerals = dbHandler.getMinerals(model.Text);
                    return new MaterialsContainer()
                    {
                        Name = Resources.Search.SuggestionTypeMinerals,
                        Materials = minerals.Cast<MaterialBaseModel>(),
                    };
                }),
                Task.Run(() =>
                {
                    var rocks = dbHandler.getRocks(model.Text);
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

            ExpandoObject jsonObject = buildMineralsSuggestionsJson(results.ToList());

            return new JsonResult(jsonObject);
        }
        #endregion

        #region SEARCHES MANAGEMENT
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteComplexSearch([FromBody] GenericRequestByIdModel model)
        {
            bool isOk = await dbHandler.deleteComplexSearchAsync(model.Id,
                                                                 getUserId());
            return new JsonResult(new GenericResponseModel() { IsOk = isOk });
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearches()
        {
            IEnumerable<ComplexSearchGeneralInfoModel>? savedSearches = dbHandler.getSavedComplexSearches(getUserId());
            return new JsonResult(savedSearches);
        }

        [HttpGet]
        public IActionResult GetSavedComplexSearchInfo(GenericRequestByIdModel model)
        {
            ComplexSearchDetailedInfoModel? result = dbHandler.getSavedComplexSearchInfo(model.Id,
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

                var saveSearchResult = await dbHandler.saveComplexSearchAsync((int)model.Id,
                                                                              model.Name,
                                                                              model.Conditions,
                                                                              getUserId());

                switch (saveSearchResult.queryResult)
                {
                    case Libraries.NetStandard.HyperLabCommonModels.Values.Enums.QueryResult.Ok:
                        result = new GenericValueStringResponseModel() { IsOk = true, Id = saveSearchResult.id };
                        break;
                    case Libraries.NetStandard.HyperLabCommonModels.Values.Enums.QueryResult.AlreadyExistingItem:
                        result = new GenericValueStringResponseModel() { IsOk = false, ExMsg = Resources.Search.SaveComplexSearchAlreadyExistingMessage };
                        break;
                    case Libraries.NetStandard.HyperLabCommonModels.Values.Enums.QueryResult.Error:
                    case Libraries.NetStandard.HyperLabCommonModels.Values.Enums.QueryResult.ErrorOnInsert:
                    case Libraries.NetStandard.HyperLabCommonModels.Values.Enums.QueryResult.ErrorOnCommit:
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
    }
}
