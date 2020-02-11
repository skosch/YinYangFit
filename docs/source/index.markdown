<article>

# YinYangFit ☯
*Modelling for automatic letterfitting, inspired by neuroscience*

<img src="img/abstract.png" alt="Abstract"/>

<h2 class="nonumber">Acknowledgements</h2>
This research would not have been possible without funding from Google.

<!--## Contents
1. [Abstract](#abstract)
2. [A good fit: what does that mean?](#intro)
4. [What can vision research teach us about letterfitting?](#vision_research_letterfitting)
5. [Models of the visual cortex](#modelling_visual_cortex)
6. [Building a multi-scale letter pair analyzer](#multiscale)
7. [Extending our model: lateral inhibition and divisive normalization](#extending)
8. Results (check back soon!)
9. Parameter tuning (check back soon!)
10. YinYangFit, the tool (check back soon!)
3. Appendix: [Exisiting letterfitting tools](#existing_tools) -->

<h2 class="nonumber">Abstract</h2>

Adjusting letter distances to be visually pleasing is a challenging and
time-consuming task. As existing tools are too primitive to reliably handle the
infinite variety of typefaces, designers have to mostly rely on their intuitive
judgment.
I review how letterfitting fits into the current scientific understanding how
letters and words are perceived in the brain, and present approximate models
that can be fitted to to existing, hand-fitted fonts using backpropagation.

<h2 class="nonumber">Epistemic status</h2> 
This article is written by an engineer, not a neuroscientist, for the benefit of
the typographic community. It is based on a survey of hundreds of peer-reviewed
scientific papers, most of which are not cited explicitly. That said,
neurocognitive hypotheses are continuously revised, discarded, and replaced.
Nothing in this article should be considered final. I welcome corrections!

## Introduction

**What is letterfitting?** Letterfitting refers to the process of adjusting the
distances between pairs of letters<label for="sn-lgl" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-lgl"
class="margin-toggle"> <span class="sidenote">I use the word "letter" very
liberally; the more general term is [glyph](https://en.wikipedia.org/wiki/Glyph).</span> during
typeface design.
<span><input type="checkbox" id="mn-lglks"
class="margin-toggle"><label for="mn-lglks"
class="margin-toggle"></label> <span class="marginnote"> <img
src="img/spacingkerning.png" alt="Spacing and kerning">Red vertical bars show
side bearings, blue vertical bar shows a negative kern.</span></span>
It's often referred to as "spacing and kerning", because pair
distances are the sum of fixed amounts of space around every letter (so-called
*side bearings*) and additional adjustment values for individual pairs
(so-called *kerns*). Quality fonts often contain thousands of hand-kerned pairs
that undergo weeks of testing and refinement.

**Why do we fit letters at all?** Some would say that well-fitted type is simply
the result of the designer's intuition for beauty. Others have tried to appeal to
the aesthetics of an "even colour", i.e. a printed page with a uniform texture
and no noticeable blobs of black or white. Meanwhile, Frank Blokland has
argued<label for="sn-lea" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-lea" class="margin-toggle"> <span class="sidenote">See
his [PhD thesis](https://www.lettermodel.org/).</span> that the distances
between letter stems are mainly a holdover from the early days of printing,
when the measurements of cast type were the result of practical considerations. None of these
explanations have yet led to an automated letterfitting algorithm<label for="sn-lea"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-lea" class="margin-toggle"> <span class="sidenote">I've listed the most
popular existing attempts in the [appendix](#existing_tools).</span> that reliably
reproduces the hand-tweaked pair distances in existing fonts of different
styles, so we need a new approach.

My hypothesis is that all of the <nobr>above—subjective beauty,</nobr>
black-white balance, and standardization across metal <nobr>type—are</nobr>
merely pleasant side effects of the pursuit of optimal legibility under the
predicted reading conditions.<label for="sn-vdss" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-vdss"
class="margin-toggle"><span class="sidenote">In cognitive science terms, I am
suggesting that a model of the [ventral
stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis#Ventral_stream)
(the systems involved in understanding what we see) may
be sufficient for a good letterfitting model, while traditional heuristics have
focused more on what could be considered computations of the
[dorsal stream](https://en.wikipedia.org/wiki/Two-streams_hypothesis#Dorsal_stream)
(the systems involved in maintaing a precise visual map of the world).</span> In other words: well-fitted text most effectively activates
the neural circuitry that allows us to read letters and words.

This is by no means a revolutionary idea,<label for="sn-cbgl"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-cbgl" class="margin-toggle"> <span class="sidenote"> Type legend Charles
Bigelow recently compiled a [comprehensive review of legibility
studies](https://www.sciencedirect.com/science/article/pii/S0042698919301087),
covering many important concepts including weight and optical sizing.</span>
yet for all the findings psychologists have made about legibility, we still have no
explicit, unified model that would allow type designers to make use of them.
Indeed, the disconnect between the two fields is quite surprising, because existing typefaces<label
for="sn-sltf" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-sltf" class="margin-toggle"> <span class="sidenote">And I
don't mean the [Sloan letters](https://en.wikipedia.org/wiki/Sloan_letters) used
by most experimental psychologists.</span> contain so much implicit information about legibility that they should be a natural,
cheap source of validation data for psychophysical theories. The goal of this
project is to lay the groundwork for such models, starting with the relationship
between pair distances and legibility.

## Visual and literal sources of poor legibility: an overview

Letterfitting, for its superficial triviality, is an astonishingly tough nut to
crack. Type designers who adjust pair distances by hand often feel that there
seems to be no right answer.<label for="sn-kerg" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-kerg"
class="margin-toggle"><span class="sidenote">If you are not a typographer, the
venerable [kern game](https://type.method.ac/) lets you experience this
feeling.</span> In those moments, letterfitting can feel arbitrary, giving
rise to the notion that the decisions are a matter of personal taste. But that
sense of subjectivity quickly wanes when pairs that appeared well-fitted on their
own suddenly stick out as noticeably loose or tight when viewed in the context
of a page of text.

There is a good reason why letterfitting is so tricky: the neural mechanisms
that will make a pair appear too tightly fitted appear to be different from the
mechanisms that will make it appear loose, and both can be active at once. And
thanks to our brain's tendency to perceive things in context, the activity of
those mechanisms depends not only on the letter shapes but also on the font
size, the lighting contrast, and the tightness of the surrounding pairs. For a
practicing designer, that means that a pair cannot be fitted until all the other
pairs are fitted as well, leading to endless tweaking and re-tweaking.

The architecture of our brain's reading circuits is still under scientific
investi&shy;gation, but the evidence points to a hierarchical network of letter
detectors, letter-combination detectors (bigrams, trigrams, common morphemes,
etc.) that interact with the brain's language areas to detect words, with some
degree of top-down modulation. The letter detectors are fed by imagery
pre-processed by the networks of the visual cortex. I will review the mechanics
of letter and word recognition in section 5.

Of the many reasons a piece of text might be poorly legible, there appear to be
two that are actually unrelated to reading, but instead associated with the
architecture of more fundamental vision circuitry. In other words: in order to
address these two major sources of poor legibility, one need not know how to
read the script at all. These phenomena, of course, are particularly interesting. We might
call them *visual*, in contrast to *literal* design issues that directly
relate to the recognition of letters of the script in question.

<img src="img/source_table.png" alt="Different sources of signal degradation">

The first visual cause of poor legibility is destructive interference at the earliest
stage of the visual cortex, V1. This is a direct result of placing shapes very
close to one another. It does not make letter recognition impossible, but it
can thwart the use of the strongest spatial frequency bands, and inadvertently
strengthen the response of other letter detectors.<label for="sn-rnmz" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-rnmz"
class="margin-toggle"><span class="sidenote">The fusion of *rn* into *m* is a
classic example.</span> This phenomenon is
relatively easy to model mathematically, and addressed in detail in section 6.

The second visual cause of poor legibility is the disruption of perceptual
grouping of letters into words. This happens when letters are too far apart.
Although grouping has been a hot topic in cognitive science ever since Gestalt
psychologists observed it nearly a century ago, researchers still aren't able to
model it reliably. All available evidence suggests that perceptual grouping is
the result of recurrent feedback mechanisms, which don't lend themselves to
straightforward computational simulation. In addition, letterfitting algorithms
operate on pairs, although, as mentioned, the strength of pair grouping may vary
with the fit of other pairs nearby. In this context of letterfitting, our
challenge will therefore be to find a reasonable approximation to the strength
of pair grouping. I address it in section 7.

Irregularly fitted text can exhibit both problems, but it is of particular
concern because failed grouping between two halves of a word can suggest the
presence of two words instead of one, which leads to competition at the word
level. Realistically, of course, irregular fits are the wild type, but it's
helpful to recognize them as hybrids with their own particular pathology.

## Letterfitting tools in context: what is and what will be

I would like to give some perspective on what has been possible in the past,
what we can hope to achieve in the present, and what may be possible in the future.
The evolution of letterfitting theories has tracked our understanding of visual
perception, albeit with some delay, and I expect that this concurrence will
continue.

The first generation of efforts to formalize letterfitting, beginning with
Kindersley's lightbox experiments, was built on metaphors drawn from geometry
and electromagnetics. Gestalt psychologists, likewise, had a tendency to refer
to observed perceptions in terms of "force fields", "lights", "areas",
"attraction", "rhythm", and so on; silly as it may seem, they repurposed the
only scientific concepts known to them at the time. This language is still
present in very recent letterfitting models. Such models, in combination with
hardcoded heuristics, can achieve good results on "normal" type. (We are here.)

The next generation will incorporate mechanistic explanations as far as
possible, and fill in the gaps with function approximators, the parameters of
which will initially be fitted to existing high-quality fonts. If 
separable, human-interpretable approximators are used—say, a set of two-dimensional
polyharmonic splines, rather than a deep neural net—then designers can tune
the behaviour of the algorithm to the style of the typeface and the predicted
reading conditions. Compared to first-gen models, this approach would presumably
generalize better to different font styles and even to different scripts; it
would allow for a more interactive design experience, and even permit—if I am
allowed the microtypographical fantasy—the estimation of per-pair tracking
stiffness coefficients.

Eventually, sufficiently rich models of the recurrent dynamics of our biological
vision networks will become available. It's possible that they will be directly
incorporated into design tools, supporting humans with design tasks that go
beyond mere letterfitting. It is also quite likely, however, that our
understanding of those dynamics will be translated directly into human-interpretable Bayesian priors
that capture our brain's inherent assumptions about our natural environment.
Those would allow us to do away with direct brain simulations, and instead
approach letterfitting from a purely entropy-minimizing perspective.<label for="sn-mrch"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-mrch" class="margin-toggle"></nobr><span class="sidenote">An overview of some of these ideas can be found in Wagemans et al.'s [review of
a century of Gestalt psychology](https://dx.doi.org/10.1037%2Fa0029334). Some
researchers are already toying with such models, e.g. Wilder et al. with their
[skeleton matching model](https://dx.doi.org/10.1016%2Fj.cognition.2011.01.009).</span>

Finally, we cannot ignore the question of whether a purely visual analysis of
letter pairs is enough. On one hand, it's evident that even the most naïve geometric heuristics
can fit most fonts to a mediocre standard; on the other, no visual model is up
to a Roundhand cursive. Indeed, the particular concern with any kind of
decorative face is that destructive interference between flourishes will throw
off the optimization.

The realistic view is that purely visual models can achieve good results, for
instance by minimizing a weighted sum of the destructive interference and
grouping disruption for each pair, but this only works for typefaces in which
the entirety of every letter should be involved in the analysis.

A hypothetical full model would require a network of letter detectors and
letter-combination detectors to correctly classify n-grams, trained on n-grams
rendered in a variety of font styles and sizes. Such a network would correctly
identify the salient parts of each letter, ignore the rest, and likely achieve
superior results.<label
for="sn-fnft" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-fntf" class="margin-toggle"></nobr><span
class="sidenote">We can get an intuition for what such a model would do by covering up parts of
letters to find out which features contribute the most to their identification
at various frequency scales, as Daniel Fiset et al. [have
done](https://doi.org/10.1111/j.1467-9280.2008.02218.x). </span>


## Vision and reading: a high-level view

Reading, as a skill, relies on specialized letter-and-word-detecting circuitry in
our brain, and this circuitry piggybacks on our generic image processing system,
the visual cortex at the back of our head.

<span><input type="checkbox" id="mn-newb" class="margin-toggle"><label
for="mn-newb" class="margin-toggle"></label> <span class="marginnote"> <img
src="img/newborn.png" alt="How a newborn sees">Newborns are not only extremely
myopic and nearly colourblind, they also lack the fine-tuning of the visual
cortex that would allow them to perceive objects clearly.</span></span> Its
layout is vaguely shaped by our mammalian genes, but its precise neural
connections develop in response to the imagery presented to it over the first
few months of our life, during which synapses that help provide useful
information about our natural world are strengthened, while others wither away.

Some of the most interesting details in our environment are lines, edges, and colours.
These basic features combine to form shapes, and shapes combine to form objects.
Our visual cortex, having sculpted itself to make the best possible use of this
natural hierarchy of information, is organized in the same way.
<label for="sn-nsce" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-nsce"
class="margin-toggle"><span class="sidenote">Much of the research on perception
is based on this idea of [statistically ideal
observers](https://en.wikipedia.org/wiki/Ideal_observer_analysis) in the context of
[natural scenes](https://en.wikipedia.org/wiki/Natural_scene_perception).
Luckily, type design doesn't involve moving objects like natural scenes do.</span> 
The first phalanx of about 140 million neurons to process input from the retina,
collectively called V1, has a single task: to activate in response to small
fragments of coloured lines and edges. Downstream, other neurons are connected
to sets of V1 neurons that are aligned to correspond to continuous lines or
corners. Further downstream, in areas V2 and V4, those neurons combine with
others to activate neurons responding to particular shapes, which further
combine to respond to objects and groups of objects. At these stages, the precise
arrangement of edges and surfaces plays a key role in perception according to
Gestalt principles.

Once the visual cortex has thus extracted some noteworthy intel about the
incoming imagery—vitally, the shape and location of groups of objects—the next step
involves the actual recognition and comprehension of said objects. For letters
this happens in the so-called *visual word form area* on the underside of the
left half of the brain, which is in turn connected to the language-recognition
networks, such as Wernicke's area.<label for="sn-vwfx"
class="margin-toggle sidenote-number"></label><input type="checkbox"
id="sn-vwfx" class="margin-toggle"><span class="sidenote">This big-picture
theory was perhaps most clearly articulated in [this 2003
article](https://doi.org/10.1016/S1364-6613(03)00134-7), which continues to set
the research agenda.</span>

## Letters, words, and uncertainty

It is deceptively easy to underappreciate the dynamic nature of these processes,
and to think of perception as data smoothly flowing upwards
through ever-higher-level brain regions, as if the brain were an assembly line
leading from our sensory organs to a place called consciousness. In reality, the
process is vigorous back-and-forth over the course of hundreds of milliseconds.<label for="sn-nxxn" class="margin-toggle
sidenote-number"></label><input type="checkbox" id="sn-nxxn"
class="margin-toggle"><span class="sidenote">[This interactive
visualization](http://nxxcxx.github.io/Neural-Network/) is far from realistic
but a much more useful visual metaphor than feed-forward deep learning
architectures.</span> As new sensory signals come in, the higher-level brain regions are already happily abuzz
with activity representing their own understanding of the world, activity which
bounces around in stable patterns and which even feeds back into the lower-level
regions to reinforce itself. Only strong, sustained sensory evidence for new
information is enough to disrupt and update the patterns. <label for="sn-ndcsx"
class="margin-toggle sidenote-number"></label><input type="checkbox"
id="sn-ndcsx" class="margin-toggle"><span class="sidenote"> This is a slapdash
framing of [set](https://en.wikipedia.org/wiki/Set_(psychology)) as [Bayesian
inference](https://en.wikipedia.org/wiki/Bayesian_inference_in_motor_learning)
via top-down modulation: the original state of the higher-level area corresponds
to a statistical prior, the updated state to a posterior, and the concept of
states itself to [attractors](https://en.wikipedia.org/wiki/Attractor). This is a deep and
fascinating area of research of itself, and this article is only meant to convey
an intuition, not a rigorous description of reality.</span>

Between detectors of letters, letter-combinations, and words, these dynamics are
necessary to resolve uncertainty about what is seen on the page. A neat example
is the following paradox, which vision researchers have probed in endless studies: on one hand,
we can raed wrods even when their letrtes are out of odrer, indicating that the
brain ignores most information about letter positions.<label for="sn-jls" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-jls"
class="margin-toggle"><span class="sidenote">[Jumbled
letters](https://en.wikipedia.org/wiki/Transposed_letter_effect) are a crowd
favourite ever since the infamous [Cambridge
email](http://www.mrc-cbu.cam.ac.uk/people/dennis.norris/personal/cambridgeemail/)
meme. The strength of the effect appears to depend on many factors: the
[relative position of the
letter](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2662926/), [the jumbling
distance](http://www.bcbl.eu/consolider/images/stories/publications/Perea_etal_ExpPsy07.pdf),
[the language](https://psycnet.apa.org/record/2008-03492-004), and even on [your
age](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6542500/) (curiously, it does
not depend on whether you are a human [or a
baboon](https://journals.sagepub.com/doi/abs/10.1177/0956797612474322)).</span> On the other hand, we
have no trouble distinguishing anagrams like *cat* and *act*. Nobody has yet
observed the responsible neurons in action, but the mountains of experimental
data tell a story that goes like this:

The word *cat* appears in the center of vision, triggering a cascade of
electrical pulses in the visual cortex. Vertical, horizontal, and angled
features are detected in various places, and they combine to activate neurons
that code for the presence of letters. In early models of reading, researchers
thought of these letter detectors as assigned to fixed positions,
representing data like *"c" in position 1*, *"a" in position 2*, and so forth—but
that's not realistic. Instead, there are probably multiple detectors activating for
each letter, and because of the spatial uncertainty introduced by multiple
levels of convolutional feature detection, all they can do is collectively express a
probability distributions in space:<label for="sn-ovel" class="margin-toggle
sidenote-number"></label><input type="checkbox" id="sn-ovel"
class="margin-toggle"><span class="sidenote">This is the [overlap
model](https://doi.org/10.1037/a0012667) by Gomez, Ratcliff, and Perea.</span>

<img src="img/ld_lcd.png" alt="Letter detector and letter combination detector neurons">

The probabilistic nature of this architecture, which is illustrated in the
diagram by circles representing stronger and weaker activations, naturally
extends to neurons which detect the presence of ordered combinations of
letters.<label for="sn-opbi" class="margin-toggle
sidenote-number"></label><input type="checkbox" id="sn-opbi"
class="margin-toggle"><span class="sidenote">The concept of such
combination-detecting neurons originated with the [open bigram
model](https://doi.org/10.1080/01690960344000198) championed by researchers
Carol Whitney and Jonathan Graigner. Soon, biologically plausible models were
proposed (I particularly like [this
paper](https://doi.org/10.1016/j.tics.2005.05.004) by Dehaene et al. for its
lucid explanations), followed by [fMRI
evidence](https://doi.org/10.1016/j.neuron.2007.05.031). </span> Although the
diagram above shows only two types of detectors—letters and bigrams—the brain
likely contains a whole interconnected hierarchy of them, detecting letters,
bigrams, trigrams, quadrigrams, and larger morphemes, all of which contribute to
the detection of the word.<label for="sn-wddt" class="margin-toggle
sidenote-number"></label><input type="checkbox" id="sn-wddt"
class="margin-toggle"><span class="sidenote">It is not clear whether detectors
correspond to single neurons (sparse coding) or constellations of neurons
(population coding), especially at the level of quadrigram or morpheme
detectors.</span> All of the above likely use overlapping,
Gaussian-weighted receptive fields.

Which word we finally perceive is not up to the letter-combination detectors,
however. Instead, that's a decision for the rather more dignified brain areas
that deal with language processing—and they are free to disagree with the visual
system. To illustrate, let's consider a situation where *cat* was, in fact, a
typo for *act*.

Imagine, for instance, that we have just read the words "police caught the bank
robber in the". Although we have not yet seen the next word (*cat*, the typo),
our language networks are already sizzling with electrical activity that renders
the neurons for *act* especially sensitive. Shortly after, some signals arrive
from below:<label for="sn-bvca" class="margin-toggle sidenote-number"></label>
<input type="checkbox" id="sn-bvca" class="margin-toggle"><span
class="sidenote">Or from behind, rather, to be faithful to anatomy.</span>
signals for CA and AT, moderate signals for AC and OA, and some weak signals for
CT, as shown in the diagram above. However, despite their strong activation, the
neurons for CA and AT find it difficult to activate any word-coding neurons.
Sure, *cat* fires some spikes, but without the support of the rest of the
language network, it's a rather hesitant activation. Meanwhile, even the
comparatively small contributions of AC and CT (and AT, which is also weakly
connected to *act*) are enough to give the primed *act* a serious boost. This
seals the deal, because *act* has neural connections going backwards to AC and
CT, creating a self-amplifying feedback loop that has *act* glowing red-hot
(metaphorically) within just tens of milliseconds, far outdoing any notion of
*cat*.<label for="sn-ctsm" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-ctsm" class="margin-toggle"><span class="sidenote">This
is a tremendous oversimplification. The neural deliberations involved in word
individuation depend on first and last letters, syllable structure, position of
vowels and consonants, and other factors that are still the subject of
painstaking research.</span> In addition, detectors likely have inhibitive
connections that implement direct competition between them, so as time passes,
*act* might actively suppress *cat*, or the two may oscillate back and forth,
depending on the circumstances. No diagram can do these complicated two-way
dynamics justice, of course, but we might visualize the effect of the initial
top-down feedback like so:

<img src="img/ld_lcd_feedback.png" alt="Letter detector and letter combination detector neurons, with feedback">

This process of "word individuation" takes about quarter of a second; meanwhile, the eyes have long moved
on to the next sentence.<label for="sn-jlsn"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-jlsn" class="margin-toggle"><span class="sidenote">There are several EEG
studies on this subject, but [this
one](https://www.pnas.org/content/113/29/8162) is especially cool as it involves
deep-brain stimulation of live human volunteers.</span> A quick reader might
therefore never notice the typo at all. Of course, this
mechanism is even more effective for jmbueld letrtes, because *letrtes* isn't a
word at all—there are no neurons or synapses coding for it in our language
system, so the next-best word will always win by default. That's true even
though the initial mismatch may be enough to draw your conscious attention,
which unpleasantly interrupts the flow of reading.<label for="sn-pmin"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-pmin" class="margin-toggle"><span class="sidenote">It's not clear how
that works, although the [predictive
coding](https://en.wikipedia.org/wiki/Predictive_coding) theories of the brain,
promoted heavily by researchers like Karl Friston and Andy Clark, provide some
promising ideas. [This article](https://dx.doi.org/10.3389%2Ffpsyg.2012.00096) by Jacob
Hohwy contains many of the relevant references.</span>

This understanding puts in stark relief what letterfitting is all about. Strong
activations in the correct letter detectors and letter-combination detectors,
and the absence of activation in distracting signals, guarantee that activity
settles on the right word detector *quickly*.<label for="sn-iptf"
class="margin-toggle sidenote-number"></label><input type="checkbox"
id="sn-iptf" class="margin-toggle"><span class="sidenote">Notably, the model
also predicts that excessively tight fits would mask jumbled letters better—I'm
not aware of any studies on this, but it certainly seems plausible. However, the
tight fit would lead to more letter identification errors ispo facto, so it's more
desirable to optimize for correctly spelled text.</span> And the faster and more
confidently readers perceive words, the faster they can read without needing to
do jump back for double-takes.<label for="sn-mrch" class="margin-toggle
sidenote-number"></label> <input type="checkbox" id="sn-mrch"
class="margin-toggle"></nobr><span class="sidenote">Saccade efficiency may be
the ultimate optimization target in type design. Indeed, researchers have
studied it for a while: Gordon Legge et al. built a statistical model called
[Mr. Chips](https://doi.org/10.1037/0033-295X.104.3.524) in 1997 to predict the
need for saccades based on partially perceived words, and [found it to work
well](https://doi.org/10.1016/S0042-6989(02)00131-1).</span>

<img src="img/no_th.png" alt="Effect of pair distances on letter detectors and LCD">

I grant that this remains a hypothesis until electrocorticographical evidence
shows an effect of letterfit on the temporal dynamics of word individuation. The
idea seems plausible, however, and compels us to find ways to quantify how pair
distances affect letter detectors and letter-combination detectors.

One could speculate that the most effective way to activate a particular letter
detector is to present only the corresponding letter, in the fovea and on an
otherwise blank page—in other words, at a pair distance of infinity, or at least
exceeding the field of vision. Contrarily, it is clear that touching or even
overlapping letters are difficult to recognize. This would suggest that more
loosely fitted words are easier to recognize, and indeed, research confirms just
that.<label for="sn-dsx" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-dsx" class="margin-toggle"><span class="sidenote">See
e.g. [these experiments](https://doi.org/10.1371/journal.pone.0047568) by Gomez
and Perea. Buy sadly there's no free lunch for typographers, either. When text
is tracked out, less of it fits into the field of sharp vision (the "visual
span", as Gordon Legge calls it), so it takes extra saccades to process the
whole text (see e.g. Legge et al.'s [visual span
experiments](https://doi.org/10.1167/7.2.9)). All in all, it's a wash in terms
of reading speed. The only ones who consistently benefit from a looser fit are
dyslexics, as [reported](https://doi.org/10.1073/pnas.1205566109) by Marco Zorzi
et al., which suggests that dyslexia is related to a deficit in letter-position
coding.</span> I provide an explanation for this in the next section.

We should also note that in tight pairs, the problem of diminished letter
detector activation is actually compounded by an increase in the activation of
the reverse-order bigram detector, which likely directly competes with the
desired bigram detector (shown as the comparatively strong activation of AC in
the top row of the diagram above). In practice, the severity of this problem likely
pales in comparison to the weakening of the letters themselves, and its
effect on word individuation speed depends on too many other factors (width
and shape of the letters, orthographic frequency of the reverse-order pair,
etc.) to model it effectively, but it is nevertheless part of a complete account.

At excessively large distances, the letter detectors are too far apart in space
in order to jointly activate the letter-combination detector, due to the limited
size of the receptive field of the latter.<label for="sn-lcdwd"
class="margin-toggle sidenote-number"></label> <input type="checkbox"
id="sn-lcdwd" class="margin-toggle"><span class="sidenote">In fact, [this
experiment](https://doi.org/10.1167/11.6.8) by Fabien Vinckier et al. showed
precisely that once more than two spaces are inserted between letters, reading
speed drops off a cliff, which aligns well with the proposed receptive field
size of bigram detectors.</span> More importantly, however, large distances
suggest the presence of a word break, which leads to competition at the word
level. This will be addressed in section 7.

## The direct effect of pair distances on the primary visual cortex

The line- and edge-detecting neurons in V1 receive input directly from the
<nobr>retina.<label for="sn-rgct" class="margin-toggle
sidenote-number"></label></nobr><input type="checkbox" id="sn-rgct"
class="margin-toggle"><span class="sidenote">There are some intermediate steps,
such as the pooling operation performed by [retinal ganglion
cells](https://en.wikipedia.org/wiki/Retinal_ganglion_cell), and any temporal
decorrelation performed in the [lateral geniculate
nucleus](https://en.wikipedia.org/wiki/Lateral_geniculate_nucleus) on the way
from the eye to the visual cortex, but we will ignore those here.</span> Each
neuron is connected to a small contiguous group of photoreceptors, its
*receptive field* (RF),<label for="sn-v1l4" class="margin-toggle
sidenote-number"></label></nobr><input type="checkbox" id="sn-v1l4"
class="margin-toggle"><span class="sidenote">To be clear, the majority of neurons
physically located in V1 don't actually receive direct input from the eye but rather just
serve as local connections to facilitate basic image enhancement, such as
contrast normalization. We shall also ignore many of the details regarding
colour perception.</span> and it will activate when a particular subset of
the receptors detects light but the others don't. The on/off subsets are
laid out such that each neuron effectively detects a small piece of a line or
edge of a particular size and orientation somewhere in the field of vision.
<label for="sn-mlct" class="margin-toggle
sidenote-number"></label><input type="checkbox" id="sn-mlct"
class="margin-toggle"><span class="sidenote">For those readers completely
unfamiliar with these concepts, I recommend watching [this introductory
animation](https://www.youtube.com/watch?v=NnVLXr0qFT8) followed by [this
Allen Institute talk](https://www.youtube.com/watch?v=mtPgW1ebxmE) about the
visual system, followed by [this in-depth MIT
lecture](https://www.youtube.com/watch?v=T9HYPlE8xzc) on the anatomical details.</span>

<img src="img/edge_line_rfs.png" />

These neurons are called *simple cells*, and we can easily predict their
response to a given input. For instance, when we see an single uppercase *I* on a page,
some simple cells will respond strongly and others not at all, depending on
the tuning and location of their receptive fields:
<label for="sn-huwi" class="margin-toggle
sidenote-number"></label></nobr><input type="checkbox" id="sn-huwi"
class="margin-toggle"><span class="sidenote">This was first discovered by David Hubel and Torsten Wiesel in the
1950s, by showing patterns of light to a cat after sticking electrodes in its brain
([video of said cat](https://www.youtube.com/watch?v=Yoo4GWiAx94)). The
researchers went on to win a Nobel Prize for their experiments.</span>

<img src="img/single_i_example.png" />

It is these signals—the image decomposed into fragments of lines and edges of
various sizes and orientations—that provide the input for further visual
processing and, ultimately, the letter detectors.
In software models, the filtering operation performed by simple cells is
typically implemented as Fourier-domain multiplication with a bank of complex
band-pass filters, which turns the two-dimensional input image into a
four-dimensional tensor (height, width, spatial frequency scales, orientations)
of complex numbers, the magnitude and phase angle of which capture the
activation of a hypothetical simple cell at every location.

As it turns out, some V1 neurons are less sensitive to phase than others, and
some may even respond equally to both lines and edges, as long as scale and
orientation match their tuning. Those cells are called *complex cells*, and how they
interact with simple cells is still unclear,<label for="sn-cce" class="margin-toggle sidenote-number"></label></nobr><input
type="checkbox" id="sn-cce" class="margin-toggle"> <span class="sidenote">Simple
and complex cells lie along a spectrum of phase specificity, which is
brilliantly explained by [this recent
paper](https://www.biorxiv.org/content/biorxiv/early/2019/09/25/782151.full.pdf)
by Korean researchers Gwangsu Kim, Jaeson Jang and Se-Bum Paik. But it seems that there's even more to
the story, as complex cells seem to [change their simpleness
index](https://hal.archives-ouvertes.fr/hal-00660536/document) in response to
their input as well.</span> although thanks to their phase invariance, they have
traditionally been modelled as summing the activations of nearby simple cells.
In software, that translates to taking the absolute magnitude of the complex
tensor mentioned above. Conventionally, the square of the magnitude is used for
further computations to account for the nonlinear behaviour of complex cells;
this is often called the *local energy*.

[image]

In the context of letterfitting (and perception research in general), the
existence of complex cells is convenient because invariance to phase implies
invariance to contrast inversion—and of course our letterfitting algorithm
needs to work equally well for white-on-black as for black-on-white text. 
The colour information is perserved by neurons in the so-called blob areas of
the visual cortex, and integrated in area V4; our concern here is only the
structure, however.<label for="sn-wbtx" class="margin-toggle
sidenote-number"></label></nobr><input type="checkbox" id="sn-wbtx"
class="margin-toggle"><span class="sidenote">In practice, dark text on light
backgrounds lead to measurably better reading performance. Not only do light
backgrounds make the pupil contract, [creating a sharper
image](http://dx.doi.org/10.1016/j.apergo.2016.11.001), but V1 outputs are also
[stronger for dark features](https:///doi.org/10.1523/JNEUROSCI.1991-09.2009),
so it seems doubtful that complex cells truly have a leading role in letter
recognition.</span> After summing over all orientations, the map of complex
cells responses for the uppercase *I* looks like this:

<img src="img/single_i_complex_example.png" />

Next, consider what happens to the activations of simple and complex cells when
a second letter is added. Shown here, for instance, are the activations of some
complex cells to the left and right side of a lowercase *n*. (The
fixed-phase receptive fields are shown only to illustrate the peak-response
phase angle at the given location).

<img src="img/abstract.png">

The V1 response to the standalone letter includes cells whose
receptive fields cover, in part, the space to the right of the letter.
Adding a neighbouring letter on the right partly fills this space, reducing the
activation of said cells. In other words: adding the neighbour directly takes
away from the signal available to stimulate higher cortical areas, i.e. the letter detectors.

This interaction goes both ways: it happens simultaneously for both involved
letters, and it is a direct result of the squashing of phases into local
magnitude values that is characteristic of complex cells. In particular, the activation near
the inner edges of the letter pair is reduced, and thanks to the squaring operation, the activation within the gap
is strengthened.<label for="sn-fftm"
class="margin-toggle sidenote-number"></label><input type="checkbox"
id="sn-fftm" class="margin-toggle"><span class="sidenote">Note also that this is distinct from the
[lateral masking effect](https://en.wikipedia.org/wiki/Lateral_masking) commonly
attributed to lateral inhibitive connections in the early visual cortex.
Somewhat surprisingly, the
only author known to me who has [published
on](https://doi.org/10.1016/j.bbr.2018.04.016) interference at the stimulus
level is researcher Bernt Christian Skottun, who has (as of early 2020) not
garnered any citations on his papers.</span>

Of course, this interference is only a concern for cells with receptive fields
affected by both letters. Receptive fields that are smaller than the gap itself are
not affected:

[image]

In other words, signals representing smaller frequency scales are only affected
when letters are very close together, while large scales see a a reduction at
larger distances too:

[image]

Research has shown that humans rely mostly on the mid-size scales for letter
 recognition.<label for="sn-mids"
class="margin-toggle sidenote-number"></label><input type="checkbox"
id="sn-mids" class="margin-toggle"><span class="sidenote">This is widely
 recognized, but perhaps most clearly described in
 [this](https://jov.arvojournals.org/article.aspx?articleid=2122458) article 
 by Oruç and Landy and
 [this](https://jov.arvojournals.org/article.aspx?articljeid=2191906) article by
 Legge and Bigelow.</span> Extra-fine
details like serifs are relatively unimportant. We can therefore assume that loss
in mid-size signals is most detrimental to the letter detectors:

[image]

Of course, the meaning of "mid-size" is relative to the font size, tying in the
idea of optical sizing: At larger font sizes, smaller details shift into the
mid-size range of spatial frequencies and dominate letterfitting decisions,
whereas at very small sizes, it is entire letters that dominate. We could think
of three broad regimes: serif-serif interference, stem-stem interference, and
letter-letter interference.

How exactly does the energy loss in certain locations, orientations and scales
affect the activation strength of the letter detectors? This is a difficult
question to answer, because we have no precise knowledge of all of the neural
computations performed between the retina and the visual word form area.
However, we can make some educated guesses, and build models of varying complexity.

One such model could be:

1. Weight all energy losses by orientation and scale, and apply an
   exponentiation to account for the possibility that some losses compound nonlinearly.
2. Sum all losses to yield a total loss.
3. The total loss is assumed to nonlinearly predict the reduction in letter
   detector strength, with a nonlinearity of arbitrary complexity and
   letter-dependent parameters.
   
This can yield surprisingly good results. It is even better, however, to attempt to model
the response of letter detectors more directly. Although we lack a full
model of the visual cortex, we must assume that letter detectors are
incentivized to distinguish letters in a statistically optimal <nobr>way:<label
for="sn-fnft" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-fntf" class="margin-toggle"></nobr><span
class="sidenote">We can get an intuition for this by covering up parts of
letters to find out which features contribute the most to their identification
at various frequency scales, as Daniel Fiset et al. [have
done](https://doi.org/10.1111/j.1467-9280.2008.02218.x). </span>

[image]

We can estimate what each letter detector looks for by simply training a
classifier against the letter shapes of the font we wish to fit:

[image]

This allows us to directly observe the effect of placing two letters directly
next to one another:

[image]

## Grouping and word breaks


Curiously, word breaks have been all but ignored in the psychophysical
literature until now. At first blush, it seems that the limited size of
combination-detector receptive fields, combined with competitive
cross-inhibition between word detectors, should be a sufficient explanation for
word breaks: a loose pair in the middle produces a weak bigram activation, which
in turn weakens the support for the whole word, in favour of the detection of
two individual fragments. This suggests that the *relative* activation of
combination detectors is most important, which agrees with the top-down feedback
model of word indviduation as well as with the observation that no apparent word
breaks are introduced if well-fitted text is tracked-out evenly. Still, it is
perhaps not the whole story, as second-order contrast normalization, gestalt
grouping, and other feedback-based mechanisms—all of which occur much earlier
during visual processing—may contribute to the perception of word edges.<label
for="sn-becm" class="margin-toggle sidenote-number"></label> <input
type="checkbox" id="sn-becm" class="margin-toggle"><span class="sidenote">The
existence of these kinds of saliency-enhancing computations in the visual cortex
is certain, but the exact influence on higher-level processes like word
individuation is not. Nevertheless, Simon Fischer-Baum and colleagues have found
that the position of word edges does indeed have particular relevance during
reading, as suggested by [priming
experiments](https://doi.org/10.3758/s13423-011-0160-3) and [brain injury
patients](https://www.tandfonline.com/doi/abs/10.1080/02643294.2014.880675).</span>
I will address those below.


## Predicting the response of combination detectors

- Use an ideal observer model to build a model of bigram detector kernels

- Problem: ii, mm, and ll all have the same distance. How can it be that 

- Reduction in ii actually makes it go away. Whereas reduction in mm creates
  competition from other letter detectors.
  
- This points towards a different mechanism of action. If we let mm get closer
  together, 

## Modelling interactions in the early visual cortex

- Divisive second-order contrast normalization
- Gestalt grouping via B/G cells
- Contour integration via V4 feedback
- Anisotropic surround integration

## Word breaks: are bigram kernels the whole story?


- Unfortunately, there is no solid research on how our brains deal with word
  breaks at all. Although separating words with spaces is not universal,<label
  for="sn-thkr" class="margin-toggle sidenote-number"></label> <input
  type="checkbox" id="sn-thkr" class="margin-toggle"><span
  class="sidenote">Historically, non-space [word
  dividers](https://en.wikipedia.org/wiki/Word_divider) symbols were common.
  Today, [Thai](https://en.wikipedia.org/wiki/Thai_script) and
  [Burmese](https://en.wikipedia.org/wiki/Burmese_alphabet) still use no word
  dividers, [Vietnamese](https://en.wikipedia.org/wiki/Vietnamese_morphology)
  divides syllables instead of words, and Koreans frequently omit spaces in
  [Hangul](https://en.wikipedia.org/wiki/Hangul) in informal writing. Then
  again, those are [isolating
  languages](https://en.wikipedia.org/wiki/Isolating_language) in which
  virtually every syllable maps directly onto a [free
  morpheme](https://en.wikipedia.org/wiki/Bound_and_free_morphemes), so spaces
  would not be of much help anyway. In more [fusional
  languages](https://en.wikipedia.org/wiki/Fusional_language) like English,
  there is no doubt that spaces help us process which morphemes belong together.
  Of course, removingspacesslowsusdown, but what's more telling is that add ing
  spa ces at syl labic breaks is less confusing than a ddi ng t hem ra ndo ml y.
  On a related note, there is some fascinating research on how our brains [break
  down
  words](https://www.researchgate.net/profile/Elisabeth_Beyersmann/publication/316312318_Edge-Aligned_Embedded_Word_Activation_Initiates_Morpho-orthographic_Segmentation/links/5addab7ca6fdcc29358b9656/Edge-Aligned-Embedded-Word-Activation-Initiates-Morpho-orthographic-Segmentation.pdf)
  into morpho-orthographic chunks during processing.</span>

## Results

(Come back soon!)

## Parameter tuning

(Come back soon!)

## YinYangFit, the tool

(Come back soon!)


<a name="existing_tools"></a>

<h2 class="appendix">Appendix: Existing letterfitting tools</h2>
Most existing approaches operate either on the distance between stems, or on the
area of the gap between them. Some are hybrids, more complex, or unpublished;
finally, there has been some experimental work using neural nets:

<img src="img/heuristics_classification.png"
alt="Heuristics" />

**Fixed-distance methods:** A family of approaches that insert pre-defined distances
between letter pairs. In their simplest incarnation, these heuristics are
equivalent to simply adding sidebearings to every letter, without any kerns.
[Kernagic](https://github.com/hodefoting/kernagic), inspired by [Frank
Blokland's research](https://www.lettermodel.org/), uses heuristics to identify
stems or stem-equivalents (such as the round sides of an o) in every letter
shape, and then aligns them. This works reasonably well with very regular type
(think blackletter), but manual adjustments are usually required. Less well
known is Barry Schwartz' [anchor point
implementation](https://github.com/chemoelectric/sortsmill/blob/master/tools/spacing_by_anchors.py)
of what amounts to basically the same idea. Adrian Frutiger, Walter Tracy and Miguel Sousa have
devised similar systems, described in Fernando Mello's [MATD
thesis](http://www.fermello.org/FernandoMello_essay.pdf).
The legendary [Hz-Program](https://en.wikipedia.org/wiki/Hz-program) is also
included in this category, as its [patent application](https://worldwide.espacenet.com/publicationDetails/originalDocument?FT=D&date=19941019&DB=&locale=en_EP&CC=EP&NR=0466953B1&KC=B1&ND=1#)
reveals that letter pair distances were simply stored in a hardcoded table.

**Gap area quadrature:** A family of algorithms that attempt to quantify and
equalize the perceived area of the inter-letter gap. The crux, of course, lies
in deciding where the gap ends. [HT
Letterspacer](https://huertatipografica.github.io/HTLetterspacer/), the crudest
one of these tools, considers everything between baseline and x-height (modulo
some minor refinements). Simon Cozens'
[CounterSpace](https://github.com/simoncozens/CounterSpace) uses blurs and
convex hulls to more effectively exclude regions that arguably don't belong to
the gap (such as the counter of c). My own [Electric
Bubble](https://www.aldusleaf.org/2019-03-17-letterfitting-attention-model.html)
model measures Euclidean instead of horizontal distances, but imposes geometric
constraints that produce similar results to CounterSpace. CounterSpace currently
wins in terms of performance-complexity ratio but it, too, struggles to fit
certain letter pairs.

**Other shape-based methods:** These include more exotic approaches, such as stonecarver [David
Kindersley](https://en.wikipedia.org/wiki/David_Kindersley)'s "wedge method"
from the 1960s, which operated on letter area moments of inertia (and didn't
really work), and [iKern](https://ikern.com/k1/), which produces great results
but, just like Adobe's [Optical
Kerning](https://typedrawers.com/discussion/3006/how-does-adobes-automatic-optical-kerning-work)
feature, remains unpublished. Last but not least, the [TypeFacet
Autokern](http://charlesmchen.github.io/typefacet/topics/autokern/typefacet-autokern-manual.html)
tool identifies parts of letter outlines that jut out horizontally, and adds
kerning to compensate, based on a few parameters.

**Neural nets:** Yes, we can train convolutional nets to recognize images of well-fitted
and poorly-fitted type. Simon Cozens has built several versions of his
[kerncritic](https://github.com/simoncozens/atokern) model (formerly AtoKern), and
the recent ones perform surprisingly well on many (if not all) pairs.
While neural nets are fascinating, they tend to be black boxes: we can only make
guesses at how they work, and we cannot tune their behaviour to suit our taste.
This problem holds not just for convolutional nets, but for statistical function
approximators in general; I will not discuss them further in this post.

**Honorable mention:** [Bubble
Kerning](https://groups.google.com/forum/#!searchin/comp.fonts/laurence$20penney$20kern/comp.fonts/GEjTE9_H52M/BSLdSE2lgmsJ)
is a proposal that type designers draw a bubble around every
letter, such that software can automatically find pair distances by simply
abutting the bubbles. While this isn't technically a letterfitting heuristic at
all, it's still worth mentioning as a neat idea that could perhaps save
designers some time. Toshi Omagari has built a [Glyphs plugin](https://github.com/Tosche/BubbleKern).
