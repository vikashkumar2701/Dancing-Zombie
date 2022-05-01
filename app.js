import './index.css'

import * as tapHtml from './tap.html'
import * as footerHtml from './footer.html'

import {scenePipelineModule} from './scene.js'
import * as camerafeedHtml from './camerafeed.html'

const onxrloaded = () => {
  XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),
    XR8.Threejs.pipelineModule(),
    XR8.XrController.pipelineModule(),
    window.LandingPage.pipelineModule(),

    XRExtras.FullWindowCanvas.pipelineModule(),
    XRExtras.Loading.pipelineModule(),
    XRExtras.RuntimeError.pipelineModule(),
    scenePipelineModule(),
  ])

  document.body.insertAdjacentHTML('beforeend', camerafeedHtml)
  document.body.insertAdjacentHTML('beforeend', footerHtml)
  document.body.insertAdjacentHTML('beforeend', tapHtml)

  XR8.run({canvas: document.getElementById('camerafeed')})
}

XRExtras.Loading.showLoading({onxrloaded})