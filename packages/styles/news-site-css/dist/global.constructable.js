const sheet = new CSSStyleSheet();
sheet.replaceSync(`html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
    margin: 0;
    padding: 0;
    border: 0;
    font: inherit;
    font-size: 100%;
    vertical-align: baseline;
}

input,
button {
    background-color: transparent;
    border-color: transparent;
    padding: 0;
}

input {
    appearance: initial;
}

svg {
    width: 100%;
    height: 100%;
}

#__next,
#__nuxt {
    width: 100%;
    min-width: 300px;
    height: 100%;
}

*,
*::before,
*::after {
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
}
`);
export default sheet;