<?php
namespace ExternalModules;
require_once 'BaseTest.php';

use \Exception;

class AbstractExternalModuleTest extends BaseTest
{
	function testCheckSettings_emptyConfig()
	{
		self::assertConfigValid([]);
	}

    function testCheckSettings_duplicateKeys()
    {
		self::assertConfigInvalid([
			'system-settings' => [
				['key' => 'some-key']
			],
			'project-settings' => [
				['key' => 'some-key']
			],
		], 'both the system and project level');

		self::assertConfigInvalid([
			'system-settings' => [
				['key' => 'some-key'],
				['key' => 'some-key'],
			],
		], 'system setting multiple times!');

		self::assertConfigInvalid([
			'project-settings' => [
				['key' => 'some-key'],
				['key' => 'some-key'],
			],
		], 'project setting multiple times!');
    }

	function testCheckSettings_projectDefaults()
	{
		self::assertConfigInvalid([
			'project-settings' => [
				[
					'key' => 'some-setting',
					'default' => true
				]
			]
		], 'Default values are only allowed on system settings');
	}

	function testCheckSettingKey_valid()
	{
		self::assertConfigValid([
			'system-settings' => [
				['key' => 'key1']
			],
			'project-settings' => [
				['key' => 'key-two']
			],
		]);
	}

	function testCheckSettingKey_invalidChars()
	{
		$expected = 'contains invalid characters';

		self::assertConfigInvalid([
			'system-settings' => [
				['key' => 'A']
			]
		], $expected);

		self::assertConfigInvalid([
			'project-settings' => [
				['key' => '!']
			]
		], $expected);
	}

	function testIsSettingKeyValid()
	{
		$m = self::getInstance();

		$this->assertTrue($m->isSettingKeyValid('a'));
		$this->assertTrue($m->isSettingKeyValid('2'));
		$this->assertTrue($m->isSettingKeyValid('-'));
		$this->assertTrue($m->isSettingKeyValid('_'));

		$this->assertFalse($m->isSettingKeyValid('A'));
		$this->assertFalse($m->isSettingKeyValid('!'));
		$this->assertFalse($m->isSettingKeyValid('"'));
		$this->assertFalse($m->isSettingKeyValid('\''));
		$this->assertFalse($m->isSettingKeyValid(' '));
	}

	function assertConfigValid($config)
	{
		$this->setConfig($config);

		// Attempt to make a new instance of the module (which throws an exception on any config issues).
		new BaseTestExternalModule();
	}

	function assertConfigInvalid($config, $exceptionExcerpt)
	{
		$this->assertThrowsException(function() use ($config){
			self::assertConfigValid($config);
		}, $exceptionExcerpt);
	}

	function testSettingKeyPrefixes()
	{
		$normalValue = 1;
		$prefixedValue = 2;

		$this->setSystemSetting($normalValue);
		$this->setProjectSetting($normalValue);

		$m = $this->getInstance();
		$m->setSettingKeyPrefix('test-setting-prefix-');
		$this->assertNull($this->getSystemSetting());
		$this->assertNull($this->getProjectSetting());

		$this->setSystemSetting($prefixedValue);
		$this->setProjectSetting($prefixedValue);
		$this->assertSame($prefixedValue, $this->getSystemSetting());
		$this->assertSame($prefixedValue, $this->getProjectSetting());

		$this->removeSystemSetting();
		$this->removeProjectSetting();
		$this->assertNull($this->getSystemSetting());
		$this->assertNull($this->getProjectSetting());

		$m->setSettingKeyPrefix(null);
		$this->assertSame($normalValue, $this->getSystemSetting());
		$this->assertSame($normalValue, $this->getProjectSetting());

		// Prefixes with sub-settings are tested in testSubSettings().
	}

	function testSystemSettings()
	{
		$value = rand();
		$this->setSystemSetting($value);
		$this->assertSame($value, $this->getSystemSetting());

		$this->removeSystemSetting();
		$this->assertNull($this->getSystemSetting());
	}

	function testProjectSettings()
	{
		$projectValue = rand();
		$systemValue = rand();

		$this->setProjectSetting($projectValue);
		$this->assertSame($projectValue, $this->getProjectSetting());

		$this->removeProjectSetting();
		$this->assertNull($this->getProjectSetting());

		$this->setSystemSetting($systemValue);
		$this->assertSame($systemValue, $this->getProjectSetting());

		$this->setProjectSetting($projectValue);
		$this->assertSame($projectValue, $this->getProjectSetting());
	}

	function testSubSettings()
	{
		$_GET['pid'] = TEST_SETTING_PID;

		$groupKey = 'group-key';
		$settingKey = 'setting-key';
		$settingValues = [1, 2];

		$this->setConfig([
			'project-settings' => [
				[
					'key' => $groupKey,
					'type' => 'sub_settings',
					'sub_settings' => [
						[
							'key' => $settingKey
						]
					]
				]
			]
		]);

		$m = $this->getInstance();
		$m->setProjectSetting($settingKey, $settingValues);

		// Make sure prefixing makes the values we just set inaccessible.
		$m->setSettingKeyPrefix('some-prefix');
		$instances = $m->getSubSettings($groupKey);
		$this->assertEmpty($instances);
		$m->setSettingKeyPrefix(null);

		$instances = $m->getSubSettings($groupKey);
		$this->assertSame(count($settingValues), count($instances));
		for($i=0; $i<count($instances); $i++){
			$this->assertSame($settingValues[$i], $instances[$i][$settingKey]);
		}

		$m->removeProjectSetting($settingKey);
	}

	private function assertReturnedSettingType($value, $expectedType)
	{
		$this->setProjectSetting($value);
		$type = gettype($this->getProjectSetting());
		$this->assertSame($expectedType, $type);
	}

	function testSettingTypeConsistency()
	{
		$this->assertReturnedSettingType(true, 'boolean');
		$this->assertReturnedSettingType(1, 'integer');
		$this->assertReturnedSettingType(1.1, 'double');
		$this->assertReturnedSettingType("1", 'string');
		$this->assertReturnedSettingType([1], 'array');
		$this->assertReturnedSettingType([], 'array');
		$this->assertReturnedSettingType(null, 'NULL');
	}

	function testSettingTypeChanges()
	{
		$this->assertReturnedSettingType('1', 'string');
		$this->assertReturnedSettingType(1, 'integer');
	}

	function testSettingSizeLimit()
	{
		$data = str_repeat('a', ExternalModules::SETTING_SIZE_LIMIT);
		$this->setProjectSetting($data);
		$this->assertSame($data, $this->getProjectSetting());

		$this->assertThrowsException(function() use ($data){
			$data .= 'a';
			$this->setProjectSetting($data);
		}, 'value is larger than');
	}

	function testSettingKeySizeLimit()
	{
		$m = $this->getInstance();

		$key = str_repeat('a', ExternalModules::SETTING_KEY_SIZE_LIMIT);
		$value = rand();
		$m->setSystemSetting($key, $value);
		$this->assertSame($value, $m->getSystemSetting($key));
		$m->removeSystemSetting($key);

		$this->assertThrowsException(function() use ($m, $key){
			$key .= 'a';
			$m->setSystemSetting($key, '');
		}, 'key is longer than');
	}

	function testRequireAndDetectParameters()
	{
		$testRequire = function($param, $requireFunctionName){
			$this->assertThrowsException(function() use ($requireFunctionName){
				$this->callPrivateMethod($requireFunctionName);
			}, 'You must supply');

			$value = rand();
			$this->assertSame($value, $this->callPrivateMethod($requireFunctionName, $value));

			$_GET[$param] = $value;
			$this->assertSame($value, $this->callPrivateMethod($requireFunctionName, null));
			unset($_GET[$param]);
		};

		$testDetect = function($param, $detectFunctionName){
			$m = $this->getInstance();

			$this->assertSame(null, $m->$detectFunctionName(null));

			$value = rand();
			$this->assertSame($value, $m->$detectFunctionName($value));

			$_GET[$param] = $value;
			$this->assertSame($value, $m->$detectFunctionName(null));
			unset($_GET[$param]);
		};

		$testParameter = function($param, $functionNameSuffix) use ($testRequire, $testDetect){
			$testRequire($param, 'require' . $functionNameSuffix);
			$testDetect($param, 'detect' . $functionNameSuffix);
		};

		$testParameter('pid', 'ProjectId');
		$testParameter('event_id', 'EventId');
		$testParameter('instance', 'InstanceId');
	}

	protected function getReflectionClass()
	{
		return new \ReflectionClass('ExternalModules\AbstractExternalModule');
	}

	protected function getReflectionInstance()
	{
		return $this->getInstance();
	}

	function testHasPermission()
	{
		$m = $this->getInstance();

		$testPermission = 'some_test_permission';
		$config = ['permissions' => []];

		$this->setConfig($config);
		$this->assertFalse($m->hasPermission($testPermission));

		$config['permissions'][] = $testPermission;
		$this->setConfig($config);
		$this->assertTrue($m->hasPermission($testPermission));
	}

	function testGetUrl()
	{
		$m = $this->getInstance();

		$filePath = 'images/foo.png';

		$expected = ExternalModules::getModuleDirectoryUrl($m->PREFIX, $m->VERSION) . '/' . $filePath;
		$actual = $m->getUrl($filePath);

		$this->assertSame($expected, $actual);
	}
}
