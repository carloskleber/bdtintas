/**
* Retorna o RGB de uma string hex (na forma "#FFFFFF")
* Os parametros [r, g, b] serao um valor entre 0 e 1
*/
function lerHex(s) {
  r = parseInt(s.slice(1,3), 16) / 255;
  g = parseInt(s.slice(3,5), 16) / 255;
  b = parseInt(s.slice(5,7), 16) / 255;
  return [r, g, b];
}

/**
* Converte uma array RGB para HSL
*
* Fonte: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
*/
function RGBtoHSL(rgb) {
  const r = rgb[0];
  const g = rgb[1];
  const b = rgb[2];
  const rgbMin = Math.min.apply(null, rgb);
  const rgbMax = Math.max.apply(null, rgb);
  var l = 0.5 * (rgbMin + rgbMax);
  if (rgbMin == rgbMax) {
    h = 0.;
  } else if (r > g && r > b) {
    h = 60. * (g-b) / (rgbMax - rgbMin);
  } else if (g > r && g > b) {
    h = 60. * (2. + (b - r) / (rgbMax - rgbMin));
  } else {
    h = 60. * (4. + (r - g) / (rgbMax - rgbMin));
  }
  if (rgbMin == 1. || rgbMax == 0.) {
    s = 0.;
  } else {
    s = (rgbMax - rgbMin) / (1. - Math.abs(rgbMax + rgbMin - 1.));
  }
  return [h, s, l];
}

/**
* Fonte: https://www.easyrgb.com/en/math.php
*/ 
function RGBtoXYZ(rgb) {
  var r = rgb[0];
  var g = rgb[1];
  var b = rgb[2];

  if (r > 0.04045) 
    r = ((r + 0.055)/1.055) ** 2.4
  else
    r = r / 12.92;
  if (g > 0.04045) 
    g = ((g + 0.055)/1.055) ** 2.4
  else                   
    g = g / 12.92;
  if (b > 0.04045) 
    b = ((b + 0.055)/1.055) ** 2.4
  else
    b = b / 12.92;

  var x = r * 41.24 + g * 35.76 + b * 18.05;
  var y = r * 21.26 + g * 71.52 + b * 7.22;
  var z = r * 1.93 + g * 11.92 + b * 95.05;
  return [x, y, z];
}

/**
* Converte uma array RGB para CIE Lab
*
* Fonte: http://www.brucelindbloom.com/index.html?Math.html
*/
function RGBtoLab(rgb) {
}

/**
* Converte uma array XYZ para CIE Lab
*
* Fonte: http://www.brucelindbloom.com/index.html?Math.html
*/
function XYZtoLab(xyz) {
  var xyzRef = [100., 100., 100.]; // referencia conforme consta no site acima, varia por tipo de iluminacao
  var x = xyz[0] / xyzRef[0];
  var y = xyz[1] / xyzRef[1];
  var z = xyz[2] / xyzRef[2];
  var coef = 16/116;
  var pot = 1/3;
  if (x > 0.008856) 
    x = x ** pot;
  else 
    x = ( 7.787 * x) + coef;
  if (y > 0.008856) 
    y = y ** pot;
  else 
    y = ( 7.787 * y) + coef;
  if (z > 0.008856) 
    z = z ** pot;
  else 
    z = ( 7.787 * z) + coef;

  var l = (116 * y) - 16;
  var a = 500 * (x - y);
  var b = 200 * (y - z);
  return [l, a, b];
}

/**
* Calcula a diferenca entre duas cores - versao 1976.
*
* Fonte: https://en.wikipedia.org/wiki/Color_difference
*/
function deltaE1976(lab1, lab2) {
  return Math.sqrt((lab2[0] - lab1[0]) ** 2 + (lab2[1] - lab1[1]) ** 2 + (lab2[2] - lab1[2]) ** 2);
}

/**
* Calcula a diferenca entre duas cores - versao 2000.
*
* Usando compensacao no chroma (kc) para ponderar uma maior diferenca
*
* Fontes: https://en.wikipedia.org/wiki/Color_difference#CIEDE2000
*         http://www2.ece.rochester.edu/~gsharma/ciede2000/
*/
function deltaE2000(lab1, lab2) {
  var pi = Math.PI;
  var kl = 1.; // Compensacao de luminosidade (lightness)
  var kc = 0.25; // Compensacao de chroma
  var kh = 0.5; // Compensacao de tonalidade (hue)
  var l1 = lab1[0];
  var a1 = lab1[1];
  var b1 = lab1[2];
  var c1 = Math.sqrt(a1**2 + b1**2);
  var l2 = lab2[0];
  var a2 = lab2[1];
  var b2 = lab2[2];
  var c2 = Math.sqrt(a2**2 + b2**2);
 
  var Cmed = (c1 + c2) * 0.5;

  var G = 0.5* (1 - Math.sqrt( (Cmed**7)/(Cmed**7 + 25**7)));

  ap1 = (1 + G)*a1;
  ap2 = (1 + G)*a2;
  Cp2 = Math.sqrt(ap2**2 + b2**2);
  Cp1 = Math.sqrt(ap1**2 + b1**2);

  Cpprod = (Cp2*Cp1);
  zcidx = find(Cpprod == 0);

  var hp1 = 0.;
  var hp2 = 0.;
  if ( (Math.abs(ap1)+Math.abs(b1)) !== 0.) {
    hp1 = Math.atan2(b1,ap1);
    if (hp1 < 0) hp1 = hp1 + 2*pi;  
  }
  if ( (Math.abs(ap2)+Math.abs(b2)) !== 0.) {
    hp2 = Math.atan2(b2,ap2);  
    if (hp2 < 0) hp2 = hp2 + 2*pi;  
  }

  dL = (l2-l1);
  dC = (Cp2-Cp1);
  var dhp;
  if (Cpprod == 0) {
    dhp = 0.;
  } else {
    dhp = hp2 - hp1;
    if (dhp > pi) {
      dhp = dhp - 2*pi;
    } else if (dhp < -pi) {
      dhp = dhp + 2*pi;
    }
  }

  dH = 2*Math.sqrt(Cpprod) * Math.sin(dhp*0.5);

  Lp = (l1+l2)*0.5;
  Cp = (Cp1 + Cp2)*0.5;
  var hp;
  if (Cpprod == 0) {
    hp = (hp1 + hp2);
  } else {
    hp = (hp1 + hp2) * 0.5;
    if (Math.abs(hp1 - hp2)  > pi) {
      hp = hp + pi;
    }
    if (hp < 0) {
      hp = hp + 2*pi;
    }
  }

  Lpm502 = (Lp - 50)**2;
  Sl = 1 + 0.015*Lpm502 / Math.sqrt(20+Lpm502);  
  Sc = 1 + 0.045*Cp;
  T = 1 - 0.17*Math.cos(hp - pi/6) + 0.24*Math.cos(2*hp) + 0.32*Math.cos(3*hp+pi/30)
    - 0.20*Math.cos(4*hp - 63*pi/180);
  Sh = 1 + 0.015*Cp*T;
  delthetarad = (30*pi/180) * Math.exp(-(((180/pi*hp - 275) / 25)**2));
  Rc =  2*Math.sqrt((Cp**7) / (Cp**7 + 25**7));
  RT =  - Math.sin(2*delthetarad) * Rc;

  klSl = kl*Sl;
  kcSc = kc*Sc;
  khSh = kh*Sh;

  var de00 = Math.sqrt( (dL/klSl)**2 + (dC/kcSc)**2 + (dH/khSh)**2 + RT*(dC/kcSc)*(dH/khSh) );
  return de00;
}

/**
* Teste da Funcao deltaE2000, para rodar no console
* Baseado nos dados do artigo do Sharma
*/
function testeDeltaE2000() {
  var lab1 = [50, 2.6772, -79.7751];
  var lab2 = [50, 0, -82.7485];
  var d = deltaE2000(lab1, lab2);
  console.log("Par 1: delta = " + d + ", esperado: 2.0425");
  lab1 = [50, -1.3802, -84.2814];
  lab2 = [50, 0, -82.7485];
  d = deltaE2000(lab1, lab2);
  console.log("Par 4: delta = " + d + ", esperado: 1.0000");
  lab1 = [50, 2.5, 0];
  lab2 = [50, 0, -2.5];
  d = deltaE2000(lab1, lab2);
  console.log("Par 16: delta = " + d + ", esperado: 4.3065");
}

class BDTintas {
  constructor(bd) {
    this.bd = bd;
    this.fabricante = new Map();
    this.norma = new Map();
  }

  carrega() {
    for (let i = 0; i < bd.childNodes.length; i++) {
      if (bd.childNodes[i].tagName == "fabricante") {
        var fab = new Fabricante(bd.childNodes[i]);
        this.fabricante.set(fab.nome, fab);
      } else if (bd.childNodes[i].tagName == "norma") {
        var nor = new Norma(bd.childNodes[i]);
        this.norma.set(nor.cod, nor);
      }
    }
  }  

  /**
  * encontra uma tinta no banco
  */
  abreTinta(f, l, cod) {
    var t = this.fabricante.get(f).linha.get(l).tinta.get(cod);
    t.abre();
  }

  /**
  * Encontra uma cor no banco de normas
  */
  abreCor(n, cod) {
    var c = this.norma.get(n).cor.get(cod);
    c.abre();
  }

  /**
  * Busca um padrao de cor similar
  *
  * @todo exibir distancia relativa entre todos os resultados em forma de grafo
  */
  buscaSimilar(hex, l, a, b) {
    document.getElementById("equiv").innerHTML = "<p>Buscando tintas equivalentes...</p>";
    var lab1 = [l,a,b];
    var lista = new Array();
    var tol = 10.; // delta maximo para ser incluido na lista de similaridade
    var delta;
    for (let f of this.fabricante.values()) {
      for (let l of f.linha.values()) {
        for (let t of l.tinta.values()) {
          //delta = deltaE1976(lab1, t.lab);
          delta = deltaE2000(lab1, t.lab);
          if (delta <= tol)
            lista.push(new CorRelat(f, l, t, delta));
        }
      }
    }
    lista.sort(function(a,b) { return a.delta - b.delta; });
   	var strB = "<p>Tintas mais proximas:</p><ul>";
		for (let t of lista) {
			strB = strB + "<li><span style='color:" + hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span><span style='color:" + t.hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span> " + t.abbr 
        + " " + t.id + " (" + t.nome + ") [" + t.acabamento + "] &Delta;E = " + t.delta.toFixed(3) + "</li>";
		}
		strB = strB + "</ul>";
    document.getElementById("equiv").innerHTML = strB;
  }


  /**
  * Busca referencias de uma cor a norma
  */
  buscaRef(hex, l, a, b, norma, id) {
    document.getElementById("equiv").innerHTML = "<p>Buscando referencias...</p>";
    var lab1 = [l,a,b];
    var lista = new Array();
    var delta;
    for (let f of this.fabricante.values()) {
      for (let l of f.linha.values()) {
        for (let t of l.tinta.values()) {
          for (let r of t.ref) {
            if (r.norma === norma && r.id === id) {
              delta = deltaE2000(lab1, t.lab);
              lista.push(new CorRelat(f, l, t, delta));
            }
          }
        }
      }
    }
    lista.sort(function(a,b) { return a.delta - b.delta; });
   	var strB = "<p>Tintas com esta referencia:</p><ul>";
    if (lista.length === 0) {
      document.getElementById("equiv").innerHTML = "<p>Nao foram encontradas tintas com referencias a esta cor.</p>";
      return;
    }
		for (let t of lista) {
			strB = strB + "<li><span style='color:" + hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span><span style='color:" + t.hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span> " + t.abbr 
        + " " + t.id + " (" + t.nome + ") [" + t.acabamento + "] &Delta;E = " + t.delta.toFixed(3) + "</li>";
		}
		strB = strB + "</ul>";
    document.getElementById("equiv").innerHTML = strB;
  }
}

class Fabricante {
  constructor(node) {
    this.nome = node.getAttribute("id");
    this.abbr = node.getAttribute("abbr");
    this.linha = new Map();
    for (let i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].tagName == "linha") {
        var l = new Linha(node.childNodes[i]);
        this.linha.set(l.id, l);
      }
    }
  }

  abre() {
    var strFab = "<h3>Fabricante: " + this.nome + "</h3>";
    for (let l of this.linha.values()) {
      strFab = strFab + l.abre(this.nome);
    }
    document.getElementById("sec").innerHTML = strFab;
    document.getElementById("cor").innerHTML = "";
    document.getElementById("equiv").innerHTML = "";
  }
}

/**
* classe que representa uma linha de produtos de um fabricante de tinta
*/
class Linha {
  constructor(node) {
    this.id = node.getAttribute("id");
    this.ref = node.getAttribute("ref");
    this.ano = parseInt(node.getAttribute("ano"));
    this.tinta = new Map();
    for (let i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].tagName == "tinta") {
        var t = new Tinta(node.childNodes[i], this.id);
        this.tinta.set(t.id, t);
      }
    } // TODO ordenar a lista de tintas pelo id?
  }

  abre(f) {
    var s = "<h3>Linha " + this.id + ", ano " + this.ano + "</h3><ul>";
    var result = new Array();
    for (let [k,t] of this.tinta) {
      result.push(t);
    }
    result.sort(function(a,b) { return a.id - b.id; });
    for (let t of result) {
      s = s + "<li><a href='#' onclick=\"bdtintas.abreTinta('" + f + "','" + this.id + "','" + t.id + "');\"><span style='color:" + t.hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span> " + t.id + " - " + t.nome + "</a></li>";
    }
    s = s + "</ul>";
    return s;
  }
}

/**
* Norma
*/
class Norma {
  constructor(node) {
    this.nome = node.getAttribute("id");
    this.cod = node.getAttribute("cod");
    this.ano = parseInt(node.getAttribute("ano"));
    this.pais = node.getAttribute("pais");
    this.ref = node.getAttribute("ref");
    this.cor = new Map();
    for (let i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].tagName == "cor") {
        var c = new Cor(node.childNodes[i], this.cod);
        this.cor.set(c.id, c);
      }
    }
  }
  
  abre() {
    var strNor = "<h3>Norma " + this.nome + ", codigo " + this.cod + "</h3><ul>";
    for (let [k,c] of this.cor) {
      strNor = strNor + "<li><a href='#' onclick=\"bdtintas.abreCor('" + this.cod + "','" 
        + c.id + "')\"><span style='color:" + c.hex + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span> " 
        + c.id + " - " + c.nome + "</a></li>";
    }
    strNor = strNor + "</ul>";
    document.getElementById("sec").innerHTML = strNor;
    document.getElementById("cor").innerHTML = "";
    document.getElementById("equiv").innerHTML = "";
  }
}

/**
* representa uma cor de norma
*/
class Cor {
  constructor(node, l) {
		if (node == null) {
    	this.id = "";
    	this.linha = "";
    	this.nome = "";
    	this.hex = "";
    	this.acabamento = "";
    	this.lab = [0,0,0];
		} else {
    	this.id = node.getAttribute("id");
    	this.linha = l;
    	this.nome = node.getAttribute("nome");
    	this.hex = node.getAttribute("hex");
    	this.acabamento = node.getAttribute("acabamento");
    	this.lab = XYZtoLab(RGBtoXYZ(lerHex(this.hex)));
		}
  }
  
  abre() {
    var strCor = "<p>Cor id: " + this.id + ", nome: " + this.nome + "</p>"
      + "<table><tr><td width='200' bgcolor='" + this.hex + "'>&nbsp;</td></tr></table>";
    strCor = strCor + "<p><a href='#' onclick=\"bdtintas.buscaSimilar('" + this.hex + "'," 
      + this.lab + ")\"> Busca por tintas</a></p>" + "<p><a href='#' onclick=\"bdtintas.buscaRef('" + this.hex + "'," 
      + this.lab + ",'" + this.linha + "','" + this.id + "')\"> Busca referencias a esta cor</a></p>";
    document.getElementById("cor").innerHTML = strCor;
    document.getElementById("equiv").innerHTML = "";
  }

  getAcabamento() {
    switch(this.acabamento) {
      case "F": // flat
        return "fosca";
      case "S": // satin
        return "acetinada";
      case "G": // gloss
        return "brilhante";
      case "M":
        return "metalica";
      case "cF":
        return "transparente fosca";
      case "cS":
        return "transparente acetinada";
      case "cG":
        return "transparente brilhante";
      default:
        return "";
    }
  }
}

/**
* Representa uma tinta, que possui os mesmos atributos de uma cor, com adicao de uma lista de referencias
*/
class Tinta extends Cor {
  constructor(node, l) {
    super(node, l);
    this.ref = Array();
    for (let i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].tagName == "ref") {
        var r = new Ref(node.childNodes[i]);
        this.ref.push(r);
      }
    }
  }  

  abre() {
    var strTin = "<p>Tinta id: " + this.id + ", nome: " + this.nome + "</p>"
      + "<table><tr><td width='200' bgcolor='" + this.hex + "'>&nbsp;</td></tr></table>"
      + "<p>Acabamento: " + this.getAcabamento() + "</p>";
    if (this.ref.length > 0) {
      strTin = strTin + "<p>Referencias:</p><ul>";
      for (let r of this.ref) {
        strTin = strTin + r.abre();
      }
      strTin = strTin + "</ul>";
    }
    strTin = strTin + "<p><a href='#' onclick=\"bdtintas.buscaSimilar('" + this.hex + "'," + this.lab + ")\"> Busca cores aproximadas</a></p>"
    document.getElementById("cor").innerHTML = strTin;
    document.getElementById("equiv").innerHTML = "";
  }
}

/**
* Representa uma cor relativa a uma tabela (norma ou fabricante), com um grau de similaridade (delta E)
*/
class CorRelat extends Cor {
	constructor(f, l, t, delta) {
		super();
		this.delta = delta;
		this.id = t.id;
		this.nome = t.nome;
		this.acabamento = t.acabamento;
		this.hex = t.hex;
		this.lab = t.lab;
		this.fabricante = f.nome;
		this.abbr = f.abbr;
		this.linha = l.id;
	}
}

/**
* Objeto de referencia de uma tinta a uma especificacao (norma ou outra tinta)
*/
class Ref {
  constructor(node) {
    this.grau = parseInt(node.getAttribute("grau"));
    this.id = node.getAttribute("id");
    this.norma = node.getAttribute("norma");
    // teoricamente pode se referir a outra tinta
  }

  /**
  * Busca a referencia no banco
  */
  abre() {
    var s = "";
    try {
      var c = bdtintas.norma.get(this.norma).cor.get(this.id);
      s = "<li>" + this.grau + ". <span style='color:" + c.hex 
        + ";'>&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span> Norma:" + this.norma + " " + c.id + "</ĺi>";
    } catch(err) {
      // referencia nao encontrada, retorna em branco
    }
    return s;
  }
}



