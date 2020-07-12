<a name="V1"></a>

## Area V1: lines and edges
Our brain's visual processing system is divided into multiple regions, each of
which represents the incoming visual imagery at a different level of
abstraction. Anything we see—landscapes, patterns, text—activates neurons in
each one of these brain areas. While neurons in the lower-level areas respond to
concrete details in the visual input, neurons in higher-level areas respond to
the presence of particular configurations of such details. Lower- and
higher-level areas are equally involved in perception, allowing us to simultaneously
experience the raw visual qualia and comprehend what we see on a more abstract
level.

Whether we are looking at an apple (and recognizing it as such), a tree (and
recognizing it as such), or a word (and reading it): the first few hundred
million neurons are the same. These early brain areas—collectively, the *visual
cortex*—are concerned purely with visual (pre-)processing, not yet with classification.

{mn} All visual input activates several pieces of visual cortex before reaching
dedicated object-detection circuitry such as the Visual Word Form Area (VWFA).
We will discuss mainly V1, V2, and V4 (the so-called [ventral
stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis)<sup>W</sup>); many
other regions exist that are dedicated to visual tasks less relevant to reading,
such as keeping track of moving objects. This big-picture view of reading was
perhaps most clearly articulated in [this 2003
article](https://doi.org/10.1016/S1364-6613(03)00134-7)<sup>[PDF](http://ling.umd.edu/~ellenlau/courses/ling646/McCandliss_2003.pdf)</sup>
by the prolific reading researchers McCandliss, Cohen and Dehaene. As we will
discuss later, the VWFA is actually multiple areas.{/mn} <img
src="img/vision_model.png" alt="Vision model">

Many readers may have had some exposure, however superficial, to the concept of
deep convolutional networks. It is tempting to conceptualize the
architecture of the visual cortex as such a network: yes, raw visual input
enters at the bottom, undergoes convolution through multiple layers, then comes
out at the top as a neat classification of a word. 
But perception, and perceptual grouping in particular, is a dynamic
process. It is not a computation with input and output, but a dance of
electrical activity that evolves through time.{sn}[This interactive
visualization](http://nxxcxx.github.io/Neural-Network/) of a brain is far from
realistic but a much more useful visual metaphor than feed-forward deep
learning diagrams.{/sn} Our goal in this section is to gain an appreciation for these recurrent neural feedback loops.

Of course, feed-forward models have their place. Even at relatively coarse
resolutions, it takes unworkably large computational resources to simulate the
visual cortex' recurrent dynamics accurately. Note, however, that our objective is
*not* to build and train a traditional convolutional net, but rather to design a
human-interpretable, interactively tunable approximation of the perception of
letter pairs.

With that in mind, let's go on a brief tour through our visual system.

### Edge and line detection by simple cells
Sensory input from the eye travels up the optic nerve, through
the lateral geniculate nucleus (LGN) on the brain's thalamus,
to the visual cortex at the very back of the head.{sn}For our
computational purposes, we will ignore any image processing
performed by the retina and thalamus, such as the luminance
adaptation and pooling operations performed by [retinal ganglion
cells](https://en.wikipedia.org/wiki/Retinal_ganglion_cell)<sup>W</sup>.{/sn}

{mn}Illustration adapted from Nicolas Henri Jacob (1781–1871), *Traité complet de l'anatomie de l'homme comprenant la médecine opératoire, par le docteur Bourgery*. Available in the [Anatomia Collection](https://anatomia.library.utoronto.ca/) of the Thomas Fisher Rare Book Library, University of Toronto.{/mn}
<img src="img/vc_anatomy.png" alt="Anatomy; location of the visual cortex">

The first phalanx of cells—the primary visual cortex,
or V1—performs what amounts to a band-filtered wavelet
decomposition. Each neuron here is directly and retinotopically{sn}That is,
neurons are laid out to [roughly mirror the organization of the
retina](https://en.wikipedia.org/wiki/Retinotopy)<sup>W</sup>, such that adjacent
photoreceptors are connected to nearby neurons in the cortex.{/sn}
connected to a small contiguous group of photoreceptors,
its *receptive field* (RF),{sn}To be clear, the majority of neurons
physically located in V1 don't actually receive direct input from the
eye but rather just serve as local connections to facilitate basic image
enhancement, such as contrast normalization, but we will skip here the
organization of V1's layers.{/sn} and activates whenever a particular
subset of the receptors detects light but the others don't. The on/off
subsets are laid out such that each neuron effectively detects a
small piece of a line or edge of a particular size and orientation
somewhere in the field of vision.{sn}This is a relatively well-known
concept, because the same kinds of receptive fields tend to emerge in the first layer of
image-classifying convolutional networks. For those readers completely
unfamiliar with these ideas, I recommend watching [this introductory
animation](https://www.youtube.com/watch?v=NnVLXr0qFT8), followed by
[this Allen Institute talk](https://www.youtube.com/watch?v=mtPgW1ebxmE)
about the visual system, followed by [this in-depth MIT
lecture](https://www.youtube.com/watch?v=T9HYPlE8xzc) on the anatomical
details.{/sn}

<img src="img/edge_line_rfs.png" />

These neurons are called *simple cells*, and we can easily predict their
response to a given input, depending on the tuning and location of their
receptive fields.{sn}David Hubel and Torsten Wiesel first discovered this in the
1950s. They showed patterns of light to a cat after sticking electrodes into its
brain (Youtube has a [video of said
cat](https://www.youtube.com/watch?v=Yoo4GWiAx94)). The two researchers went on
to win a Nobel Prize for their experiments.{/sn} In software models, the
filtering operation performed by simple cells is typically implemented as
Fourier-domain multiplication with a bank of complex band-pass filters, each of
which is tuned to a particular orientation and spatial frequency.

Leaving the technical details for later sections, here is how sets of
similarly-tuned simple cells would respond to the image of a dark vertical bar:

<img src="img/single_i_example.png" />


### Complex cells
As it turns out, some V1 neurons are less sensitive to phase than others, and
some may even respond equally to both lines and edges, as long as scale and
orientation match their tuning. Those cells are called *complex
cells*.{sn}Simple and complex cells lie along a spectrum of phase specificity,
which is brilliantly explained by [this recent
paper](https://doi.org/10.1101/782151)<sup>[PDF](https://www.biorxiv.org/content/biorxiv/early/2019/09/25/782151.full.pdf)</sup>
by Korean researchers Gwangsu Kim, Jaeson Jang and Se-Bum Paik. But it seems
that there's even more to the story, as complex cells seem to [change their
simpleness
index](https://doi.org/10.1038/nn.2861)<sup>[PDF](https://hal.archives-ouvertes.fr/hal-00660536/document)</sup>
in response to their input as well.{/sn} Thanks to their phase invariance,
complex cells can extract key structural information at the expense of colour
and contrast data. In the following picture, all complex cell responses of a
given frequency scale are shown together, regardless of the orientation:

<img src="img/single_i_complex_example.png" />

It so happens that contrast and colour are mostly irrelevant to reading; after
all, we can read black-on-white just as well as white-on-black. This suggests
that it is mainly complex cells that provide the reading-relevant signals to
higher-level brain areas.{sn}In practice, it is measurably easier to read dark
text on light backgrounds. Not only do light backgrounds make the pupil
contract, <nobr>[creating a sharper
image](http://dx.doi.org/10.1016/j.apergo.2016.11.001)<sup>[PDF](http://jdobr.es/pdf/Dobres-etal-2017-Ambient.pdf)</sup></nobr>,
but V1 outputs are also <nobr>[stronger for darker
colours](https:///doi.org/10.1523/JNEUROSCI.1991-09.2009)<span class="oa"
title="Open Access"></span></nobr>, which may bias shape perception in
higher-level stages. Nevertheless, reading is primarily shape- and not
colour-based.{/sn} Arguably, this contrast invariance holds for texture and Gestalt perception as
well.

To be clear, this does not mean that the signals from simple cells are lost or
discarded. Just like the signals from colour-detecting cells in the so-called
*blob* regions of V1, which are not discussed here, the signals from simple
cells do contribute both to our experience of vision and to the activity of
higher-level brain regions. For reading (and thus letterfitting) purposes,
however, we will focus on the responses of complex cells.

### Lateral inhibition
Neurons in V1, like neurons elsewhere in the brain, use lateral connections to
inhibit their neighbours. This is called *lateral inhibition*. Because the
strength of the inhibition depends directly on the strength of the neuron's own
activation, this setup helps the most active neuron to mute its neighbours. This
sharpens the response landscape, which is helpful considering that given any
visual input, neurons tuned *almost*, but not quite, to the right orientation
and frequency will still fire quite a bit, effectively adding noise to the
signal. Lateral inhibition also reduces the influence of the overall brightness
of the input image, in favour of more local contrast. Lateral inhibition is a
recurrent mechanism, and as such cannot be simulated by a purely feed-forward model.{sn}Deep learning
practitioners achieve similar results by normalizing their datasets and, more
recently, actively factoring out correlations (see e.g. [this 2020
paper](https://arxiv.org/pdf/1905.11926.pdf) by Chengxi Ye and colleagues). We
will stay within the limits of biological plausibility here, but discuss the
classic *divisive normalization* approximation in a later section.{/sn}

### Contrast sensitivity to spatial frequencies
{mn}<img src="img/csf.png" alt="Contrast sensitivity function">Contrast
sensitivity function. The vertical gradient in contrast is uniform
across the image, but we most easily perceive the mid-frequency gratings
even at lower contrasts. Note that the red line, shown here only
for illustrative purposes, may not match the contrast sensitivity
function you experience at your current viewing distance and screen
settings.{/mn} Another aspect of vision that appears to manifest quite
early during visual processing—setting aside the optical limitations
of our eye—is our specific sensitivity to spatial frequencies. Humans
respond particularly well to angular frequencies of about 2–5 cycles
per degree, and unsurprisingly this translates to reading speed as well,
*especially* under low-contrast conditions.{sn}See studies like <nobr>[Chung
and Tjan (2009)](https://doi.org/10.1167/9.9.16)<span class="oa" title="Open
Access"></span></nobr>, <nobr>[Oruç and Landy
(2009)](https://doi.org/10.1167/9.9.4)<span class="oa" title="Open
Access"></span></nobr>, and many others.{/sn} This,
of course, is a key reason why e.g. hairline type is difficult to read
at smaller-than-huge sizes and a comparatively loose fit. The reader's
contrast sensitivity function may in fact contribute to the exact relative
weighting of the laterally-inhibitive connections; in other
words, mid-scale signals may outcompete fine-scale signals by default.
Even lacking perfect information about such correlations, we can point
to the contrast sensitivity function as the most basic biological *raison
d'être* for optical sizes in typography, and to letterfitting models based on spatial frequency
channels as a natural fit for this aspect of type design.

We will return to the question of how V1 outputs vary in response to
changing pair distances in a later section. For now, let's move on to how these
signals are processed in subsequent areas.

<a name="V2"></a>

## Area V2: contours and textures

Area V1 deconstructs the incoming imagery into thousands of edge and line
fragments. Area V2 helps find patterns in those signals, patterns that form the
basis for the perceptual grouping effect we are interested in.

Each neuron in V2 takes its input from a combinations of neurons in
V1,{sn}Again, we will skip here a discussion of the various layers and
interneurons of V2.{/sn} creating receptive fields that can be twice as large as
those in V1. Any particular V2 neuron could take inputs from any variety of V1
neurons that are retinotopically nearby. And indeed, V2 comprises a vast diversity
of cells representing correlations between all kinds of different V1 signals:
correlations between V1 simple cells and complex cells, between V1 cells of
different scales and orientations, and between V1 cells at different spatial
locations. {mn}<img src="img/v1_v2.png" alt="Connections from V1 to V2">V2 cells
take their input from a nearby V1 cells, correlating receptive fields across
dimensions of space, simpleness/complexity, orientation, and spatial frequency
scale.{/mn}

Presumably, the ability to respond to correlations—not just sums—of inputs from V1 is
conferred to V2 neurons by their nonlinear activation curve. Consider a toy
example in which two V1 neurons each fire with rates between 0 and 1.0. Then a V2
neuron with the following activation curve would fire only if *both* inputs are
sufficiently active, summing to at least 1.5, thereby implementing correlation:

{mn}Shown on the left is a hyperbolic ratio function, which we will discuss later.
But even simple squaring nonlinearities would allow computing
correlations; Anthony Movshon and Eero Simoncelli [call
this](https://doi.org/10.1101/sqb.2014.79.024844)<sup>[PDF](http://symposium.cshlp.org/content/early/2015/04/29/sqb.2014.79.024844.full.pdf)</sup> the "cross term", referring to the
$ab$ in $(a+b)^2 = a^2 + 2ab + b^2$. Finally, the dashed line shows the
deep-learning equivalent nonlinearity $\mathrm{ReLU(x-1.0)}$.{/mn} <img
src="img/v2_nonlinearity.png" alt="Nonlinear activation of V2 neurons
enables computation of correlations">

Generally, whenever such a cell is active, it also *reinforces* its input cells via
feedback connections. Such feedback loops are common throughout the brain, and
allow patterns of neural activity to remain stable—at least for a short while,
until new input signals, a shift in attention, or inhibition from other neurons
disrupt the loop. Crucially, this positive feedback only
amplifies neurons that are already firing; it does not induce activity in other
inputs (and may even suppress them).{sn}Physiologically, this kind of modulatory
amplification may be related to increased spike synchrony between neurons, as
explored in <nobr>[this 2016 study](https://doi.org/10.1152/jn.01142.2015)<span
class="oa" title="Open Access"></span></nobr> by Wagatsuma et al.{/sn} {mn}<img
src="img/contour_integration_example.png" alt="Contour integration
example">Typical contour integration test image demonstrating contour pop-out.
Adapted from <nobr>[Roudaia et
al.](https://doi.org/10.3389/fpsyg.2013.00356)<span class="oa" title="Open
Access"></span></nobr>, 2013.{/mn}

Unfortunately, we have no direct measurements of what each of these neurons
respond to most strongly. However, pre-trained image classification networks
contain units in their early convolutional layers that are, presumably, somewhat
analog to V2 cells. By iteratively tweaking white noise until these units are
maximally activated, we can estimate what kinds of correlations in the input
they are tuned to:

{mn}These images were adapted from an <nobr>[interactive online
article](https://doi.org/10.23915/distill.00024)<span class="oa" title="Open
Access"></span></nobr> by Chris Olah and his colleagues at OpenAI, who have
published lots of neat approaches to explain and interpret the inner workings of
convolutional networks. Note that in the human brain, colour information is not
integrated quite like it is here; the important aspect is the correlation
between edge- and line-detecting simple cells and complex cells of various
scales and orientations.{/mn}
<img src="img/v2_texture_neurons.png" alt="Some kernels from Inception V1"/>

There is no clear way for us to segment this population of receptive fields into
a clear taxonomy. But taking some artistic license, we may acknowledge that most
cells detect rather texture-like correlations, while a few select ones are more dedicated to
oriented edges and lines.

### Texture detection via V2 statistics
On their own, many of the texture-like patches may appear to be meaningless.
Taken together, however, they really do describe the local texture of an image. As it
turns out, a mere few dozen of such correlations seem to be almost all that is
needed for human texture perception. In fact, we can iteratively generate fake
images, starting again from white noise, that result in the same combination of
local averages of these presumed V2 responses as in the original image.{sn}The
first iteration of this
<nobr>[idea](https://doi.org/10.1023/A:1026553619983)<sup>[PDF](https://www.cns.nyu.edu/pub/lcv/portilla99-reprint.pdf)</sup></nobr>
came about in 1999, long before the heyday of convolutional deep nets, and is
due to to Javier Portilla and Eero Simoncelli. Two decades later, these
"Portilla-Simoncelli textures" remain a key concept at the heart of many more
sophisticated models of texture.{/sn} If the local averaging takes place over a
large area, as is the case in the visual periphery, this can result in very
distorted imagery that nonetheless appears uncannily real:

{mn}The "image metamer" shown here was
[generated](https://dx.doi.org/10.1038%2Fnn.2889)<sup>[PDF](https://www.cns.nyu.edu/pub/eero/freeman10-reprint.pdf)</sup> by Jeremy Freeman and Eero
Simoncelli in 2011 based on the abovementioned principle of matching image statistics. As
in the human brain, the authors averaged the statistics over a wider area in the
periphery than in the fovea. When focusing strictly on the image center (best viewed
closely or after zooming in), the metamer is difficult to distinguish from the
original.{/mn} <img src="img/metamers.png" alt="From 'Metamers of the ventral
stream'">

As evident here, a mere approximation of these
averaged image statistics measured by V2 is enough to simulate,
with eerie fidelity, how we perceive our visual periphery. This is no coincidence:
after all, higher-level areas (here, V4) precisely respond to
particular configurations of such V2 neurons, so synthesizing images
which evoke similar V2 activations will also result in similar
higher-level perceptions, even if the actual input signals are quite
different.{sn}One could think of this as the bizarro-version of an [adversarial
input](https://en.wikipedia.org/wiki/Adversarial_machine_learning)<sup>W</sup>.{/sn}

### Texture statistics and letterfitting
That V2 neurons so effectively capture local image statistics presents us with a
first opportunity to reify the heretofore vague concept of typographic "colour"
into something concrete and computable: namely, local combinations of such
(simulated) V2 responses. If these remain uniform across the whole page, the
texture is perceived as even:

{mn}Here, Javier Portilla and Eero Simoncelli demonstrated how a set of V2 statistics
computed and averaged over an image of text could be used to extrapolate
the perceived texture outwards. The comparably poor quality of
this example taken from their paper should not be taken as reason
to dismiss the idea; it was generated at low resolution over two
decades ago and averaged the statistics too aggressively. Many more
sophisticated variants of the model have since been published, with promising
results especially on natural scenes.{/mn} <img
src="img/text_v2_texture.png" alt="Texture extension on image of text.
From Portilla and Simoncelli, 2000.">

In a truly colour-based letterfitting strategy, which should be relatively easy
to implement, we would iteratively adjust pair distances within an image of text
until a chosen set of V2 responses is nice and uniform across the entire image.
And indeed, this would probably be the most effective and biologically faithful
approach to achieve a perfectly even texture. Unfortunately, in shifting letters
to optimize solely for overall colour, the algorithm would disfigure the
*gestalten* of individual words, at times even rendering them
illegible.{sn}Consider that in the theoretical limit, a perfectly uniform
texture determined by a fixed number of such correlations would be perfectly
periodical, so an additional constraint (e.g. "letters must not overlap") would
be necessary to preserve enough [useful
information](https://en.wikipedia.org/wiki/Entropy_(information_theory)), but
probably not sufficient to guarantee an aesthetic result at the word level.{/sn}
For that reason, it does not make for a good optimization target, even though
the texture of well-fitted text is typically (but not necessarily) quite even
across the page.

### Surround suppression
Adding to the complexity of the network, texture-detecting V2 neurons return not only
reinforcing feedback but also inhibitive feedback, especially to its V1 inputs
in the center. This kind of "surround suppression", which acts in addition to
the lateral inhibition between V1 cells discussed above, helps mute V1 activity
inside similarly-textured areas.{sn}Although we are mainly interested in
suppressive feedback here, multiple mechanisms seem to be implicated in the
modulation of visual signals; the 2019 <nobr>[EEG
study](https://doi.org/10.1167/19.4.12)<span class="oa" title="Open
Access"></span></nobr> by Schallmo et al. contains a comprehensive review. For
attempts to reproduce the effect using computational modelling, see e.g. the
work of Ruben Coen-Cagli et al.
<nobr>[here](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4624479/)<span
class="oa" title="Open Access"></span></nobr>.{/sn} Because this mechanism
*leasts* affects the boundaries between differently-textured surfaces, it allows
us to perceive the outlines of textured objects even when those are weaker (in
terms of raw V1 responses) than the textures themselves: consider a Zebra on the
savanna, or a cluster of regular strokes on a white background, such as a word
on a page.

<img src="img/surround_suppression.png" alt="surround suppression example" />

This surround suppression therefore is a kind of early perceptual grouping
mechanism, enabled by correlation-detecting V2 neurons.{sn}Another way to think
of this, from the perspective of [predictive
coding](https://en.wikipedia.org/wiki/Predictive_coding)<sup>W</sup>, is as compression of
redundant signals, as <nobr>[pointed out](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5836998/)<span class="oa" title="Open
Access"></span></nobr> by Laurence Aitchison and Máté Lengyel.{/sn} The strength of the
segmentation certainly depends greatly on the scale, pattern, and contrast of
the objects involved, so it is difficult to say to what degree it affects the
perception of words. But inhibitive (as well as facilitatory) feedback is likely
present between higher-level brain areas as well, and the corresponding dynamics
are implicated in other grouping-related phenomena as well, such as *crowding*,
which we will address later.

Finally, it doesn't take a cognitive scientist to know that fonts designed based
on consistent, repeating elements are easier to read.{sn}Still, they have
studied it more thoroughly than one might expect; see <nobr>[this 2012
review](https://doi.org/10.3758/s13414-011-0220-9)<span class="oa" title="Open
Access"></span></nobr> by Thomas Sanocki and Mary Dyson.{/sn} This so-called
"font tuning" has in the past been attributed to an unexplained ability of
letter detectors (which we discuss below) to rapidly adjust their filter kernels
to font designs. But of course, we here have a perfectly parsimonious
explanation in V2 texture correlations: stylistic similarities between letters
are simply redundancies in spatial statistics. Texture-detecting neurons absorb
and suppress them, such that primarily the non-repeating features (i.e.,
terminals and horizontals rather than stems and serifs) maintain enough salience
to excite letter detectors in higher-level areas. In "frankenfonts", such
suppression is impossible, resulting in more irrelevant visual data impinging on
letter detectors, resulting in poorer letter classification performance. Perhaps
future design tools could visualize this mechanism to help designers find
inconsistencies in their fonts.

### Contour integration and V1 feedback

Not all V2 neurons pick up the peculiar, texture-like V1 correlations. Some
detect signals with more human-interpretable salience, such as continuous edges
and lines. Experiments suggest that they do so by responding to V1 complex cells
that co-align:

{mn}Each cell corresponds to a V1 complex cell tuned to a certain
orientation (the distribution in frequency scales is ignored here).
Note that the number of V1 cells is exaggerated for effect. This neuron
responds to collinear V1 activations suggesting the presence of a
horizontal contour, even if curved (see the gray stroke in the sample shown). It may be inhibited by parallel
flanking contours and perpendicular contours, although this is less
clear. This pattern has been called "association field", "bipole",
and many other names in papers going back to the 1990s.{/mn} <img src="img/v2_contour_integration.png"
alt="Receptive fields of a V2 contour integration neuron">

This allows these V2 cells to detect continous contours, even if these
contours are curved or interrupted.{sn}Two studies showing this most clearly are by [Minggui Chen et al. from 2014](https://doi.org/10.1016/j.neuron.2014.03.023)<span class="oa" title="Open Access"></span> and by [Rujia Chen et al. from 2017](https://doi.org/10.1016/j.neuron.2017.11.004)<span class="oa" title="Open Access"></span>.{/sn} Interrupted contours are a constant
challenge to the vision system: the edges of an object can be
occluded not only by other objects—think tree branches in front of a mountain—but also by the spider web of light-scattering
nerve bundles and capillaries that carpet our retina.{sn}Not to mention our
[blind spot](https://en.wikipedia.org/wiki/Blind_spot_(vision))<sup>W</sup>.{/sn}
Contour-integrating V2 cells thus help us perceive contours even where we cannot
actually see them. Of course, the same principle applies to texture integration across
space.

Thanks to the reinforcing feedback loop between such a contour-detecting V2 cell
and its V1 inputs, contiguous contours pop out to us perceptually in a matter of
milliseconds, while non-contour features (like the dot in the illustration
below) do not:

<img src="img/v2_contour_integration_2.png">

This kind of feedback loop is a simple grouping mechanism of its own, and
responsible for many (though not all) observations of *prägnanz* due to
collinearity. As we will see below, however, it is also an important ingredient in
letter and word perception.

<a name="V4"></a>

## Area V4: convex fragments

The next area of the visual cortex, area V4, mirrors the architecture of V2 in
that it performs a set of convolutions detecting correlations between its
inputs. It is reasonable to conceptualize V4 as V2, only with larger receptive
fields. Its neurons respond, once again, to a large variety of spatial correlations in
the input image, although these correlations can be more complex, looking
perhaps more like this:

{mn}Again, these images are taken from <nobr>[Olah et al.,
2020](https://doi.org/10.23915/distill.00024)<span class="oa" title="Open
Access"></span></nobr>. The images give a good
intuition for the higher complexity of the patterns detected in V4.{/mn}
<img src="img/v4_texture_neurons.png" alt="higher-level receptive fields from InceptionNet">

Once again, some neurons tend to be more tuned to textures while others detect
straight or curved contour fragments, although there certainly is overlap
between the two categories.{sn}Studies like <nobr>[this
one](https://doi.org/10.1523/JNEUROSCI.3073-18.2019)<span class="oa" title="Open
Access"></span></nobr> by Anitha Pasupathy and her collaborators clearly show
this overlap within biological V4 populations, at least in the brains of their macaque monkey
subjects.{/sn} Just as in V2, the contour detectors integrate smaller contour
fragments across a larger region. However, the larger receptive fields of V4
allow for the target contours to be substantially offset from the center of the
neuron's receptive field. As such, V4 neurons centered on a target object can
more easily detect parts of the object's contour:

{mn}Note how all shapes have the convexity on the lower left in common. The
particular V4 neuron shown here responds to objects that are centered in its
receptive field and which exhibit just such a convexity. Indirectly, this V4
neuron detects correlations between a great number of complex cell responses in
V1.{/mn} <img src="img/v4_rf.png" alt="Receptive field and some example stimuli
for a V4 object-centered contour-detecting cell">

V4 neurons, too, form feedback loops with their V2 inputs. V4 neurons, in turn,
serve as input to higher-level brain areas that are more specialized for object detection.

