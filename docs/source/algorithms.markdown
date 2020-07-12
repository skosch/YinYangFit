## Filtering
Unfortunately, the dynamism of the model(s) introduced thus far makes them
unsuitable for use in practical letterfitting tools for type designers. Although
it is relatively straightforward to set up systems of coupled differential
equations representing individual neurons, time-integrating them at a
sufficiently fine spatial resolution is immensely costly, and doing so at many
pair distances for each letter combination is outright infeasible, at least with
consumer-grade hardware.{sn}The most promising approach would be backpropagation
combined with an adaptive ODE solver, as in [this much-celebrated
demonstration](https://arxiv.org/pdf/1806.07366.pdf) by Ricky Chen and his
colleagues.{/sn} We therefore need to consider potential approximations.{sn}Of
course, existing letterfitting heuristics *are* such approximations, even though
they don't know it (see the [appendix](#existing_tools) for an incomplete
list).{/sn}

The central idea is that the optimal distance $\hat{d}$ corresponds to the best
trade-off between skeleton degradation and perceptual grouping. We penalize the former with values $p$,
reward the latter with values $r$, and expect the
minimum of the total to coincide with the optimal distance:

{mn}The cost function has a
minimum at the optimal distance $\hat{d}$. This works when the cost of skeleton
losses rises more steeply than the reward (i.e. negative cost) for grouping. As
expected, the total cost approaches zero with increasing distance, and becomes
very large when the letters touch at $d=0$. Reviving an outmoded force-field
metaphor, we might compare this curve to an [interatomic potential
well](https://en.wikipedia.org/wiki/Interatomic_potential)<sup>W</sup>.{/mn}
<img src="img/model_gains_losses.png" alt="computational graph leading to the final cost curve">

As we now understand, skeleton degradation is the *loss* in G-cell activations
that occurs when we juxtapose two letters. To compute this loss, we compare the
G-cell responses to the letter pair at distance $d$, viz. $G_{lr}(d)$, with the
sum of the responses to either letter when placed alone in the same position,
$G_l(d) + G_r(d)$. The loss is thus 

$$ \lfloor (G_l(d) + G_r(d)) - G_{lr}(d)\rfloor ^+,$$

where $\lfloor x \rfloor ^+$ represents ReLU, i.e.
$\mathrm{max}(x, 0)$. Two major contributors to this loss are destructive
interference in V1 and border-ownership competition in V2.{sn}Of course, a
number of other suppressive and facilitative feedback mechanisms are involved,
but ignored here to keep the model manageable.{/sn}

Perceptual grouping, on the other hand, corresponds to the *gain* in G-cell
activations due to the juxtaposition:{sn}To be exact, such gains occur
independently in areas V2 and V4 as well, but we can indirectly capture most of these
upstream effects by measuring the G-cells.{/sn} 
$$
\lfloor G_{lr}(d) - (G_l(d) + G_r(d)) \rfloor ^+.
$$
Responsible for this gain is the nonlinear behaviour of the modelled G-cells.

There are many ways to estimate $G(d)$ for some input image, and the following model is but one option:

<img src="img/model_sequence.png" alt="Computational graph of the model">

We will discuss the sequency of computations in the next sections.

### Modelling activations of V1 cells
{mn}
<img src="img/model_sequence_v1.png" alt="V1 convolution">
{/mn}

As explained above, V1 simple cells are typically modelled as responding
linearly. Their responses can be approximated via convolution with a bank of
bandpass filters <nobr>$G(s, \gamma)$</nobr> representing their receptive fields,
where $s$ is the frequency scale and $\gamma$ the orientation.{sn}This is best known
as [Gabor filtering](https://en.wikipedia.org/wiki/Gabor_filter)<sup>W</sup>,
but Gabor filters are only one of many mathematical functions that happen to
look like simple cell receptive fields. Many alternatives with better
mathematical properties are available.{/sn}

For instance, we might use
derivative-of-Gaussians filters: $$ G(s, \gamma=0^{\circ}) = \frac{x
e^{-\frac{x^2+y^2}{2s^2}}}{2\pi s^4}
  + \mathrm{i} \left[\frac{e^{-\frac{x^2+y^2}{2 s^2}}}{2\pi s^3} - \frac{x^2 e^{-\frac{x^2+y^2}{2 s^2}}}{2\pi s^5} \right],
$$
where the real and imaginary parts correspond to odd and even filters, respectively:
<img src="img/filter_bank.png" alt="filter bank">

This set of convolutions turns the two-dimensional input
image (width × height) into a four-dimensional tensor of complex numbers (width
× height × spatial frequency scales × orientations), the magnitude and phase
angle of which capture the activation of simple cells $S_\mathrm{V1}$ at every
location:

$$
S_\mathrm{V1}(x, y, s, o) = \mathcal{F}^{-1}(\mathcal{F}(I(x, y)) \mathcal{F}(G(s, o))),
$$

where $\mathcal{F}$ is the Fourier transform.{sn}The discrete Fourier transform
is a good choice when filters are large, but requires generous zero-padding to
prevent wrapping. In implementations relying on small inputs and/or filters
(e.g. dilated filters, downsampled G-cell layers, etc.), direct convolution may
be advantageous.{/sn} For instance, to retrieve wthe activation of
representative simple cells at phases 0°, 90°, 180° and 270°, one ould
half-wave-rectify as follows:

{mn}<img src="img/complex_value.png">{/mn}
$$
\begin{aligned}
S_{\mathrm{V1, 0\degree}}(x, y, s, o) &= |\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 90\degree}}(x, y, s, o) &= |\mathrm{Im}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 180\degree}}(x, y, s, o) &= |-\mathrm{Re}(S_1(x, y, s, o)| \\
S_{\mathrm{V1, 270\degree}}(x, y, s, o) &= |-\mathrm{Im}(S_1(x, y, s, o)| \\
\end{aligned}
$$

Traditionally, complex cells were thought to sum the outputs of nearby simple
cells of equal scale and orientation. This is now known to be a gross
oversimplification. In software, a summation-like approach is nevertheless taken to
approximate the output of complex cells $C_{\mathrm{V1}}$, namely a simple computation of the
absolute magnitude of the complex tensor:

$$
C_\mathrm{V1}(x, y, s, o) = |S_\mathrm{V1}(x, y, s, o)|
$$

This is often called the *local energy*:{sn}Or the local energy's square root, depending on the author.{/sn}

{mn}Simulated complex cell responses for a lowercase *u*, at various scales and
orientations. No squaring or other nonlinearity has been applied.{/mn}
<img src="img/complex_activations_u.png" alt="Complex activations before
nonlinearization, letter u">

### Destructive interference in V1
As discussed above, neighbouring letters can cause destructive interference in
their respective complex cell responses. This happens when they are close enough
together that the relevant V1 receptive fields captures both letters.

This destructive interference naturally takes place in our model as well:
whenever two complex numbers are added, the resulting magnitude can never exceed
the sum of the original magnitudes. In fact, wherever the two inputs are not
exactly in phase, the opposite components cancel and the resulting magnitude is
reduced.

However, this is not necessarily true when the V1 complex cells behave
nonlinearly. Such nonlinearities can sometimes lead to gains in the activation,
even despite the destructive interference, especially in the gap:

<img src="img/abstract.png">

{mn}<img src="img/hra.png" alt="HRA"> Solid line: hyperbolic ratio curve, a.k.a.
[Hill function](https://en.wikipedia.org/wiki/Hill_equation_(biochemistry)<sup>W</sup>)
or Naka-Rushton function. Dotted line: monotonic polynomial (e.g. $x^2$).{/mn}

While complex cells are often modelled with a parabolic activation function
(like $y=ax^2$), this is a rather unrealistic choice. In a real cells, the
firing rate will level off after the input has been increased beyond some limit.
A popular model for this behaviour is the hyperbolic ratio sigmoid

$$y = \frac{x^k}{\beta^k + x^k}$$

The $k$ makes the kink steeper and $\beta$ shifts the threshold to the right.
Unless an additional factor is introduced, the quotient approaches 1 for large
values of $x$. Consider how the numerator increases the firing rate, and the
denominator decreases it.{sn}This specific activation function is effectively
never used in deep learning, both for historical reasons and because [its
asymptotic behaviour would slow down
training](https://en.wikipedia.org/wiki/Vanishing_gradient_problem)<sup>W</sup>.{/sn}

We will apply this activation function to the V1 complex cell output, using the
matrices $\boldsymbol{k}_{s,\gamma}$ and $\boldsymbol{\beta}_{s,\gamma}$ as coefficients.

### Measuring G-cell activations
Having calculated the V1 complex cell responses, we can next estimate the magnitude of local
B-cells. Just like complex cells, B-cells come in scales and orientations.
However, the number of orientations is doubled, because there are two opposite
B-cell orientations for each axis (whereas in V1, 0° and 180° are identical).

At first, we have no information about border ownership, so opposite-orientation
B-cells are assumed to have equal-strength activations:

$$
B(x,y,s,p) = C_\mathrm{V1}(x,y,s,o)
$$

where $p = (p+180^\circ) = o$.

We then convolve this with circular contour fragments, similar to what V4 receptive fields look like.

Separating angular and radial
factors is a convenient way to do this, like so:

$$
\begin{aligned}
R(c, w) &= e^{-\frac{(\sqrt{x^2+y^2}-c)^2}{2 w^2}}\\
A(o) &= \frac{1}{2\pi I_0(\alpha)} e^{-\alpha \cos(\tan^{-1}(y^2/x^2) \{- \pi\} - \pi o)},\\
\end{aligned}
$$

where $I_0$ is the 0<sup>th</sup>-order modified Bessel function of the first kind, and $\alpha$ is the angular width of the fragment.

Each convolution draws from a set of B-cells, the scale of which is always smaller. This yields a set of responses

$$
L(x, y, o, c)
$$

To assemble this set of V4 contour fragments into a single G-cell response, we
assume a weight matrix. We also have a nonlinearity. We then perform the
convolution in reverse. Deconvolution via division in frequency domain is
typically a noisy process; but fortunately, our V4 contour fragment filters come
in pairs, so we just convolve again with the same set of filters, but rotated by
180.

This tells us where B-cells need to be strengthened (via modulation). We perform
this modulation multiplicatively, then perform local divisive normalization
within the modulated $B$.

Finally, we convolve to find $G$ again.

<p class="missing">
Improve explanation, provide illustrations.
</p>


### Parameter-fitting via backpropagation
We define our total cost $c$ at a distance $d$ as the sum of the penalties
associated with losses, $l(d)$, and the rewards associated with gains, $g(d)$:

$$
  c(d) = l(d) + g(d).
$$

This cost $c(d)$ should take on its minimum value at the optimal distance $\hat{d}$:

$$
  \hat{d} = \underset{d}{\mathrm{arg\,min}}\enspace c(d).
$$

Note how this cost function is quite different than the mean-squared error we would expect to
see in a regression model, i.e. in an attempt to directly predict from the pair
image the deviation (in pixels) from the optimal pair distance. Although direct regression
models may *seem* like an obvious choice for the problem of letterfitting, a
pixel worth of error can have very different perceptual effects in different
letter pairs—and the weights of such models cannot easily be understood and
tweaked by human users.

Here, we need to address one practical issue: our cost function $c(d)$ isn't
differentiable with respect to the distance $d$, because $d$ is merely a
parameter—an integer number of pixels, really—passed to the function that renders the images of the pair. However,
we can construct a passable workaround by rendering not one, but three (or more)
pair images at once, at distances $(\hat{d} -\Delta d)$, $\hat{d}$, and $(\hat{d} + \Delta d)$.
We then instruct the optimizer to minimize the following instead:

$$
c' = \mathrm{max} \left[ c(\hat{d}) - c(\hat{d}-\Delta d), c(\hat{d}) - c(\hat{d}+\Delta d) \right]
$$

This rewards parameters for which the cost $c(d)$ is lowest at $d = \hat{d}$ for all pairs.

<p class="missing">
Provide illustrations.
</p>


### Modulatory feedback to B-cells

<p class="missing">
Explain nonlinear activation of G-cells, deconvolution and modulation of B-cells
</p>

<p class="missing">
Explain the need for lateral inhibition between competing B-cells via divisive normalization
</p>

### Modelling lateral inhibition via divisive normalization

The hyperbolic-ratio activation function is particularly relevant thanks to *lateral inhibition*,
a common architectural pattern in the brain in which neurons within
a cortical area suppress their neighbours in proportion to their own
firing rate. Locally, this allows the most active neuron to suppress
its neighbours more than those neighbours are able to suppress it in
return. Lateral inhibition thus sharpens peaks and flattens valleys
in the activity landscape; it is a simple and effective way to boost
salient signals relative to the weaker ones that inevitably arise from the
correlations between similarly tuned convolution filters. In V1,
lateral inhibition thus sharpens the orientation and frequency-scale signals,
while also normalizing local contrast.

Because lateral inhibition is a recurrent process that takes time to
reach a steady state, it is most accurately modelled using a system
of coupled differential equations which describe the time dependence of each
neuron's firing rate on its neighbours. Conveniently, however, the
steady-state activations can also be approximated directly using our hyperbolic ratio
model, by simply sneaking the neighbouring neurons' activities into the
denominator:{sn}See <nobr>[this analysis](https://arxiv.org/pdf/1906.08246.pdf)<span class="oa" title="Open
Access"></span></nobr> by
Jesús Malo et al. to understand how this approximation works.{/sn}

$$y_i = \frac{fx_i^k}{\beta^k + \sum_j w_j x_j^k}$$

This approximation is called *divisive normalization*. One can find many
variations on the above formula in the literature: extra constants,
extra square roots in the denominator, extra rectifiers, etc.; but the
core idea is always the same.

This raises the challenge of determining the right values for $w_j$, i.e.
modelling the inhibitive strengths of neighbourly connections. Researchers have
collected formulas,{sn}In 2011, Tadamasa Sawada and Alexander
Petrov compiled a <nobr>[very long review](https://doi.org/10.1152/jn.00821.2016)<span class="oa" title="Open
Access"></span></nobr>
of divisive normalization models of V1. To my knowledge, it is still the most
comprehensive reference today.{/sn} but it is not clear that they capture all of
the interactions there are. What's more, the last decade of research has
revealed that some measured behaviours previously ascribed to lateral inhibition
may instead be the result of feedback from higher-level areas. If nothing else, $w_j$ is probably a convenient place for modellers to incorporate
the effects of spatial frequency dependency (i.e. contrast sensitivity curves).

### Final activation of G-cells

<p class="missing">
G-cells activate via normalized B-cells.
</p>

<p class="missing">
Loss from V1 interference vs. loss from lateral inhibition in V2
</p>

<a name="spacing-kerning"></a>

## Deriving spacing and kerning values
Given a set of pair distances (measured as the horizontal component of the line
between outline extrema) $d_{ij}$, where $i$ and $j$ index the left and right
glyph from a set of glyphs $G$, we can find the optimal assignment of side
bearings and kerning values via a simple linear programming model
$$
\begin{aligned}
\mathrm{Min.}&\sum_{i\in G,j\in G} |k_{ij}|\\
\mathrm{such\;that\;}&r_i + k_{ij} + l_j = d_{ij}\quad\forall i \in G, j \in G,\\
\end{aligned}
$$
where $l_i$ and $r_i$ are the left and right side bearings of glyph $i$, and
$k_{ij}$ the kerning value required.

Alternatively, a quadratic objective can be used instead of the sum of
magnitudes,

$$
\begin{aligned}
\mathrm{Min.}&\sum_{i\in G,j\in G} k_{ij}^2\\
\mathrm{such\;that\;}&r_i + k_{ij} + l_j = d_{ij}\quad\forall i \in G, j \in G;\\
\end{aligned}
$$

different formulations will either minimize overall kerning (for best appearance
with applications that do not support kerning, e.g. sprite-based rendering) or maximize the
number of near-zero kerns that can then be eliminated entirely (minimizing file size).

<p class="missing">
More complex optimization models to implement efficient class kerning,  likely via constraint programming.
</p>
