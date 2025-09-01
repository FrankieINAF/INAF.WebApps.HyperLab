using INAF.Libraries.Net.CommonWebAppModels.Models.Permissions;
using INAF.Libraries.Net.DB.HyperLabData;
using INAF.Libraries.Net.DB.HyperLabUsers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Info;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Pages;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Searches.Interfaces;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Shares;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.WebApp.Requests;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using INAF.WebApps.HyperLab.Models;
using INAF.WebApps.HyperLab.Values;
using LinqKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
//using Newtonsoft.Json;

namespace INAF.WebApps.HyperLab.Controllers
{
    public partial class SpectraManagerController : BaseController
    {
        private readonly DbHandlerHyperLabData dbHandlerHyperLabData;
        private readonly DbHandlerHyperLabUsers dbHandlerHyperLabUsers;

        public SpectraManagerController(IServiceProvider serviceProvider,
                                         ILogger<SpectraManagerController> logger,
                                         DbHandlerHyperLabData dbHandlerHyperLabData,
                                         DbHandlerHyperLabUsers dbHandlerHyperLabUsers) : base(serviceProvider, logger)
        {
            this.dbHandlerHyperLabData = dbHandlerHyperLabData;
            this.dbHandlerHyperLabUsers = dbHandlerHyperLabUsers;
        }

        #region VIEWS
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Chart([FromForm] NavigateToChartModel model)
        {
            HttpContext.Session.SetString(Constants.LAST_PAGE, nameof(Chart));
            (bool isUserAuthenticated, List<PermissionModel>? permissions) status = getUserStatus();

            IEnumerable<int>? Ids = model.SelectedSpectra ?? Array.Empty<int>();
            SelectedSpectraModel? selectedSpectra = null;
            if (model.SelectedSpectra != null && model.SelectedSpectra.Length > 0)
            {
                selectedSpectra = new SelectedSpectraModel() { Ids = Ids };
            }

            ChartPageModel chartPageModel = new ChartPageModel(status.isUserAuthenticated, status.permissions, selectedSpectra);

            return View(chartPageModel);
        }

        [HttpGet]
        public IActionResult Hub()
        {
            string? lastSearch = string.Empty;
            if (HttpContext.Session.ContainsKey(Constants.LAST_PAGE))
            {
                string? lastPage = HttpContext.Session.GetString(Constants.LAST_PAGE);
                if (!string.IsNullOrEmpty(lastPage) && lastPage.Equals(nameof(Chart)))
                    lastSearch = HttpContext.Session.GetObjectString(Constants.LAST_SEARCH);
            }
            else
                HttpContext.Session.SetString(Constants.LAST_PAGE, nameof(Hub));

            (bool isUserAuthenticated, List<PermissionModel>? permissions) status = getUserStatus();

            var sampleTypesHelper = serviceProvider.GetRequiredService<SampleTypesHelper>();
            SampleTypeValuesContainerExtended sampleTypeValuesContainerExtended = SampleTypeValuesContainerExtended.Create(sampleTypesHelper.getSampleTypeValuesContainer());
            var searchPageModel = new SearchPageModel(status.isUserAuthenticated, status.permissions, sampleTypeValuesContainerExtended, lastSearch);
            return View(searchPageModel);
        }
        #endregion

        [Authorize]
        [CheckIsLoginValid]
        [HttpPost]
        public IActionResult ExecuteLastSearch()
        {
            object? lastSearch = HttpContext.Session.GetObject<SessionSearchModel>(Constants.LAST_SEARCH);
            if (lastSearch != null)
            {
                var sessionSearchModel = lastSearch as SessionSearchModel;
                if (sessionSearchModel != null)
                {
                    switch (sessionSearchModel.SearchType)
                    {
                        case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleByFilename:
                            //SearchRequestByTextModel? model = JsonSerializer.Deserialize<SearchRequestByTextModel>(sessionSearchModel.SearchObjectJson!);
                            //if (model != null)
                            //    return SearchSimpleGroupsByFilename(model, saveSessionVariable: false);
                            break;
                        //return RedirectToAction(
                        //    nameof(SpectraManagerController.SearchSimpleGroupsByFilename2),
                        //    GenericHelper.GetControllerName(nameof(SpectraManagerController)),
                        //    sessionSearchModel.SearchObject as SearchRequestByTextModel
                        //);
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleByMaterial:
                        //    break;
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleByMineralType:
                        //    break;
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleByOriginType:
                        //    break;
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleBySampleName:
                        //    break;
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.SimpleBySampleType:
                        //    break;
                        //case Libraries.Net.HyperLab.CommonModels.Values.Enums.SearchType.Complex:
                        //    break;
                        default:
                            break;
                    }
                }
            }

            /* when no last search has been saved, simply remove key and redirect to 'Hub' to load view from scratch  */
            HttpContext.Session.Remove(Constants.LAST_SEARCH);

            return RedirectToAction(nameof(Hub));
        }

        [Authorize]
        [CheckIsLoginValid]
        [HttpGet]
        public async Task<IActionResult> SharedStuff()
        {
            IEnumerable<SharedSpectrumModel>? spectraSharedWithMe = null;
            IEnumerable<SharedSpectrumModel>? spectraSharedByMe = null;
            var tasks = new List<Task>
            {
                Task.Run(() => spectraSharedWithMe = getSharedSpectra(getUserId(), dbHandlerHyperLabData.getSharedSpectraForSubjectUser)),
                Task.Run(() => spectraSharedByMe = getSharedSpectra(getUserId(), dbHandlerHyperLabData.getSharedSpectraByOwnerUser))
            };
            await Task.WhenAll(tasks);

            SharedStuffContainer sharedStuffContainer = new SharedStuffContainer(spectraSharedByMe, spectraSharedWithMe);

            return View(sharedStuffContainer);
        }

        #region ANCILLARY
        private ContentResult buildJsonContentResult(object? inputValue)
        {
            string jsonResult = JsonSerializer.Serialize(inputValue);
            return Content(jsonResult, "application/json");
        }

        private IEnumerable<ISpectraGroupInfoModel>? retrieveSpectraFilesForGroups(IEnumerable<ISpectraGroupInfoModel>? spectraFilesInfo,
                                                                                   List<int> levelIds)
        {
            spectraFilesInfo?.ForEach(spectraGroupInfo =>
            {
                List<SpectrumInfoModel>? spectrumInfoModels = dbHandlerHyperLabData.searchGroupItems(spectraGroupInfo.Id,
                                                                                                     levelIds,
                                                                                                     getUserId());
                if (spectrumInfoModels?.Count > 0)
                    spectraGroupInfo.Spectra = spectrumInfoModels;
            });

            return spectraFilesInfo;
        }

        private IEnumerable<SharedSpectrumModel>? getSharedSpectra(int userId, Func<int, List<SharedSpectrumModel>?> function)
        {
            List<SharedSpectrumModel>? sharedSpectra = function(userId);
            if (sharedSpectra == null || sharedSpectra.Count == 0)
                return null;

            foreach (var sharedSpectrum in sharedSpectra)
            {
                sharedSpectrum.OwnerUser = dbHandlerHyperLabUsers.getUserDetailsSimple(sharedSpectrum.OwnerUser!.Id);
                sharedSpectrum.SubjectUser = dbHandlerHyperLabUsers.getUserDetailsSimple(sharedSpectrum.SubjectUser!.Id);
            }

            if (sharedSpectra.Any(x => x.AmITheOwner))
                return sharedSpectra.OrderBy(x => x.SubjectUser!.Name).ThenBy(x => x.Filename);
            else
                return sharedSpectra.OrderBy(x => x.Filename);
        }
        #endregion
    }
}
