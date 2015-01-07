<html>
  <head>
	<title>Music XML</title>
	<meta name="viewport" content="initial-scale = 1.0, minimum-scale = 1.0, maximum-scale = 1.0, user-scalable = no">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<script src="jquery-1.11.1.min.js"></script>	
	<script src="vexflow-debug.js"></script>
	<script src="jquery.xml2json.js" type="text/javascript" language="javascript"></script> 
	<script type="text/javascript" src="debugout.js"></script>
	<script src="java.js" type="text/javascript" charset="utf-8"></script>
	<script src="pitchdetect.js"></script> 
	<link href="style.css" type="text/css" rel="stylesheet">	
	        
	<script type="text/javascript" src="lib/MIDIBridge.js"></script>     
	<script type="text/javascript" src="lib/MIDIDeviceSelector.js"></script>     
	<script type="text/javascript" src="js/setup-connections-direct.js"></script>
  </head>
  <body>
	<div id='rappeur'>
	  	<select id='opt'>
			<?php
				$files = glob('music/*.{xml}', GLOB_BRACE);
				$prefix = 'music/';
				foreach ($files as $value) {
					if (substr($value, 0, strlen($prefix)) == $prefix){
						$name = substr($value, strlen($prefix));
					}
			?>
					<option value="<?php echo($value)?>"><?php echo($name)?></option>
			<?php } ?>
	  	</select>
		<form action="upload.php" method="post" enctype="multipart/form-data" id="forme">
			<input type="file" name="fileToUpload" id="fileToUpload" accept="text/xml">
			<input type="submit" value="Upload XML" name="submit">
		</form>
	</div>
	<div id="btns" >
		<button class="btn" id="startle">Start</button>
	</div>
	<div id="wrappeurre" style="display:none">
		<div id="toggles">
			<input type="checkbox" name="checkbox1" id="checkbox3" class="ios-toggle" checked/>
			<label for="checkbox3" class="checkbox-label" data-off="Piano" data-on="Voice" status="vo"></label>
		</div>
	</div>
	<div id="beauTom" style="display:none;">
		<div class="bottomNote" id="n1"></div>
		<div class="bottomNote" id="n2"></div>
		<div class="bottomNote" id="n3"></div>
		<div class="bottomNote" id="n4"></div>
		<div class="bottomNote" id="n5"></div>
		<div class="bottomNote" id="n6"></div>
		<div class="bottomNote" id="n7"></div>
		<div class="bottomNote" id="n8"></div>
		<div class="bottomNote" id="n9"></div>
		<div class="bottomNote" id="n10"></div>
	</div>
	<div id="hertzThing">
		<div id="detector" class="vague">
			<div class="pitch"><span id="pitch">--</span>Hz</div>
			<div class="note"><span id="note">--</span></div>   
			<canvas id="output" width=300 height=42></canvas>
			<div id="detune"><span id="detune_amt">--</span><span id="flat">cents &#9837;</span><span id="sharp">cents &#9839;</span></div>
		</div>
	</div>
	<div id="content" style="display:none">
		<select id="inputs"></select>
	</div>
	<!-- incoming MIDI messages get displayed here -->
	<div id="messages"></div>
	<div id="viewer">
		<p>Please enable JavaScript to use the viewer.</p>
	</div>
  </body>
</html>

