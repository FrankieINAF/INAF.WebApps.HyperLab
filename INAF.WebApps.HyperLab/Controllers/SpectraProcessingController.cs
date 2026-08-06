using INAF.Libraries.Net.HyperLab.CommonHelpers;
using INAF.Libraries.Net.HyperLab.CommonModels.Models.Spectrum.Processing;
using INAF.Libraries.Net.Math.Models;
using INAF.WebApps.HyperLab.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace INAF.WebApps.HyperLab.Controllers
{
    public class SpectraProcessingController : BaseController
    {
        public SpectraProcessingController(IServiceProvider serviceProvider,
                                           ILogger<SpectraProcessingController> logger) : base(serviceProvider, logger)
        { }

        [HttpPost]
        public async Task<IActionResult> GetPMinPMaxMaxValue([FromBody] PMinPMaxMaxValueRequestModel model)
        {
            if (model.Xs == null || model.Ys == null || model.FitMethod == null)
            {
                logger.LogError($"{nameof(GetPMinPMaxMaxValue)} - model is invalid");
                return new EmptyResult();
            }

            var pMinPMaxHelper = serviceProvider.GetRequiredService<PMinPMaxHelper>();
            PMinPMaxResultModel result = await pMinPMaxHelper.getPMinPMaxMaxValueAsync(model.Xs, model.Ys, model.FitMethod);

            return new JsonResult(result);
        }
    }
}
