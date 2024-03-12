using INAF.Libraries.Net.CommonWebAppModels.Models.Requests;
using INAF.Libraries.Net.SLabDbLibrary;
using INAF.WebApps.HyperLab.Attributes;
using INAF.WebApps.HyperLab.Controllers.Base;
using INAF.WebApps.HyperLab.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    [Authorize]
    [CheckIsLoginValid]
    public class ChartsController : BaseController
    {
        public ChartsController(IServiceProvider serviceProvider, 
                                DbHandler dbHandler, 
                                ILogger<BaseController> logger) : base(serviceProvider, dbHandler, logger)
        { }

        [HttpPost]
        public IActionResult GetSpectra([FromBody] GenericRequestByIdsModel model)
        {
            if (model.Ids == null || model.Ids.Count == 0)
                return new JsonResult(null);

            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createMultipleSpectraJson(model.Ids, getUserId()));
        }

        [HttpPost]
        public IActionResult GetProcessedSpectrum([FromBody] GenericRequestByParentIdAndSpectrumTypeModel model)
        {
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createSingleSpectrumJson(model.ParentId, model.SpectrumType, getUserId()));
        }

        [HttpGet]
        public IActionResult GetWhiteSpectraForAlignment()
        {
            List<int> ids = dbHandler.getWhiteSpectraForAlignmentIds();
            var chartsHelper = serviceProvider.GetRequiredService<ChartsHelper>();
            return new JsonResult(chartsHelper.createRefWhitesJson(ids, 0)); // operationUserId = 0 for 'white' spectra available for everyone (not related to a specific insertUserId)
        }
    }
}
